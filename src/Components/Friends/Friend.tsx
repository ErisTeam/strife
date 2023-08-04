import { ChannelType, Relationship } from '../../discord';

import style from './css.module.css';

import { useNavigate, useParams } from '@solidjs/router';
import { useAppState } from '../../AppState';
import { Tab, TextChannelTab } from '../../types';

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
		img = '/Friends/fallback.png';
	}
	const params = useParams();
	const navigate = useNavigate();
	const href = `/app/@me/${props.relationship.user.id}`;
	const AppState = useAppState();
	const tab: TextChannelTab = {
		type: 'textChannel',
		component: null,
		title: props.relationship.user.username,
		icon: img,
		tabData: {
			channelId: props.relationship.user.id,
			guildId: '@me',
		},
	};
	function handleClick(e: MouseEvent) {
		console.log('clicked on', props.relationship.user.username, href);
		const tabS = AppState.Tabs.tabs.find(
			(t: any) => t.type === 'textChannel' && t.tabData.channelId === tab.tabData.channelId,
		);
		switch (e.button) {
			case 0:
				console.log('left click', e.button);

				if (tabS) {
					AppState.Tabs.setCurrentTab(AppState.Tabs.tabs.indexOf(tabS));
				}
				if (AppState.Tabs.currentTab() != -1) {
					AppState.Tabs.setCurrentTab(AppState.Tabs.tabs.indexOf(tabS));
				} else {
					AppState.Tabs.addTab(tab, true);
				}
				break;
			case 1:
				console.log('middle click', e.button);
				if (tabS) {
					console.error('Tab already exists!');
				} else {
					AppState.Tabs.addTab(tab, true);
				}
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
				<img src={img} alt={props.relationship.user.display_name} />

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
