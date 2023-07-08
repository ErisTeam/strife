// API
import { useNavigate, useParams } from '@solidjs/router';
import API from '../../API';
import { Channel as ChannelType } from '../../discord';

// Style
import style from './css.module.css';
import { useAppState } from '../../AppState';
import { Tab } from '../../types';
import { CONSTANTS } from '../../Constants';
import { createSignal, getOwner } from 'solid-js';
import ContextMenu, { useMenu } from '../ContextMenu/ContextMenu';
import OpenInNewTab from '../ContextMenuItems/OpenInNewTab';

interface ChannelProps {
	data: ChannelType;
}

const Channel = (props: ChannelProps) => {
	const [displayName, setDisplayName] = createSignal(props.data.name);
	function handleClick(e: MouseEvent) {
		console.log('clicked on', props.data.name, href);
		switch (e.button) {
			case 0:
				console.log('left click', e.button);
				if (AppState.tabs.find((t: Tab) => t.channelId === props.data.id)) {
					navigate(href);
					return;
				}
				if (AppState.tabs.length === 0) {
					API.addTab(props.data);
					navigate(href);
					return;
				} else {
					API.replaceCurrentTab(props.data, params.channelId);
					navigate(href);
				}
				break;
			case 1:
				console.log('middle click', e.button);
				if (AppState.tabs.find((t: Tab) => t.channelId === props.data.id)) {
					console.error('Tab already exists!');
					navigate(href);
					return;
				}
				API.addTab(props.data);
				navigate(href);
				break;
		}
	}

	const voiceIcon = (
		<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48">
			<path d="M564.783 928.109v-65.158q96.761-28.19 158.38-107.571Q784.783 676 784.783 575t-61.12-180.88q-61.119-79.881-158.88-107.071v-65.158q125.011 28.179 203.821 126.666Q847.413 447.043 847.413 575q0 127.957-78.809 226.443-78.81 98.487-203.821 126.666ZM112.587 701.978V449.782h163.587l208.609-208.369v669.174L276.174 701.978H112.587Zm432.196 44.174V404.848q55.717 17.717 89.174 64.975 33.456 47.258 33.456 106.193 0 57.941-33.956 105.299-33.957 47.359-88.674 64.837Zm-128.37-332.891L306.522 518.152H180.957v115.696h125.565l109.891 105.891V413.261ZM324.565 576Z" />
		</svg>
	);
	const chosenIcon = () => {
		//extract emoji from name
		const emoji = props.data.name.match(/\p{Extended_Pictographic}/gu);
		if (emoji) {
			//remove emoji from name
			const regEx = new RegExp(emoji[0], 'g');
			setDisplayName(props.data.name.replace(regEx, ''));
			return emoji[0];
		}
		switch (props.data.type) {
			case CONSTANTS.GUILD_TEXT:
				return '#';
			case CONSTANTS.GUILD_VOICE:
				return voiceIcon;
			case CONSTANTS.GUILD_CATEGORY:
				return '📁';
			case CONSTANTS.GUILD_ANNOUNCEMENT:
				return '📢';
			case CONSTANTS.GUILD_DIRECTORY:
				return '📁';
			case CONSTANTS.GUILD_FORUM:
				return '📰';
			case CONSTANTS.GUILD_STAGE_VOICE:
				return '🎤';
		}
	};
	const AppState = useAppState();
	const navigate = useNavigate();
	const params = useParams();
	const href = `/app/${props.data.guild_id}/${props.data.id}`;

	let openRef;
	return (
		<li class={style.channel} ref={openRef}>
			<button
				onMouseDown={(e) => {
					e.preventDefault();
					handleClick(e);
				}}
			>
				<div class={style.icon}>{chosenIcon()}</div>
				{displayName()}
			</button>
			<ContextMenu data={{ channel: props.data }} openRef={openRef}>
				<OpenInNewTab />
			</ContextMenu>
		</li>
	);
};

export default Channel;
