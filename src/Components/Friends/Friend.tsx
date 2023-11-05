import { Relationship } from '../../types/User';

import style from './css.module.css';

import { useNavigate, useParams } from '@solidjs/router';
import { useAppState } from '../../AppState';
import { Tab } from '../../types';

import { add, setAsCurrent } from '@/API/Tabs';

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
	const displayName = props.relationship.user.global_name || props.relationship.user.username;
	const AppState = useAppState();
	const tab: Tab = {
		component: 'textChannel',
		title: props.relationship.user.username,
		icon: img,
		channelId: props.relationship.user.id,
		guildId: '@me',
	};
	function handleClick(e: MouseEvent) {
		console.log('clicked on', props.relationship.user.username, href);

		const listIndex = AppState.tabs.findIndex(
			(t: Tab) => t.component == 'textChannel' && t.channelId == props.relationship.user.id,
		);

		console.log('listIndex', listIndex);
		switch (e.button) {
			case 0:
				console.log('left click', e.button);
				if (listIndex == -1) {
					add(tab, true);
				}
				setAsCurrent(tab);
				break;
			case 1:
				console.log('middle click', e.button);
				if (listIndex != -1) {
					setAsCurrent(listIndex);
				} else {
					add(tab);
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
				<img src={img} alt={props.relationship.user.global_name} />

				<main>
					<span>{displayName}</span>
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
