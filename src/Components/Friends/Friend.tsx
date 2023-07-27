// SolidJS

// API

// Style
import { Show } from 'solid-js';
import { CONSTANTS, Relationship } from '../../discord';

import style from './css.module.css';
import fallback from './fallback.png';
import { useNavigate, useParams } from '@solidjs/router';
import { useAppState } from '../../AppState';
import { Tab } from '../../types';

import API from '../../API';

//fallback icon provided by Lemony
interface FriendProps {
	className?: string;
	relationship: Relationship;
}
const Friend = (props: FriendProps) => {
	let img;

	if (props.relationship.user.avatar) {
		img = `https://cdn.discordapp.com/avatars/${props.relationship.user.id}/${props.relationship.user.avatar}.webp?size=32`;
	} else {
		img = fallback;
	}
	const params = useParams();
	const navigate = useNavigate();
	const href = `/app/@me/${props.relationship.user.id}`;
	const AppState = useAppState();
	const tab = {
		guildId: '@me',
		channelId: props.relationship.user.id,
		channelName: props.relationship.user.username, //TODO:figure out why display name is sometimes null then replace
		channelType: CONSTANTS.CHANNEL_TYPES.DM,
		guildIcon: img,
		guildName: '@me',
	};
	function handleClick(e: MouseEvent) {
		console.log('clicked on', props.relationship.user.username, href);
		switch (e.button) {
			case 0:
				console.log('left click', e.button);
				if (AppState.tabs.find((t: Tab) => t.channelId === tab.channelId)) {
					navigate(href);
					return;
				}
				if (AppState.tabs.length === 0) {
					API.addTab(tab);
					navigate(href);
					return;
				} else {
					API.replaceCurrentTab(tab, params.channelId);
					navigate(href);
				}
				break;
			case 1:
				console.log('middle click', e.button);
				if (AppState.tabs.find((t: Tab) => t.channelId === props.relationship.user.id)) {
					console.error('Tab already exists!');
				} else {
					API.addTab(tab);
				}
				navigate(href);
				break;
		}
	}
	return (
		<li class={style.friend}>
			<button
				onmousedown={(e) => {
					e.preventDefault();
					handleClick(e);
				}}
			>
				<img src={img} alt={props.relationship.user.username} />

				<main>
					<span>{props.relationship.user.username}</span>
					<p>
						Super duper long status because i am a stupid little nerd that cant fit his funny little text in less than
						50 characters
					</p>
				</main>
			</button>
		</li>
	);
};

export default Friend;
