// API
import { useNavigate, useParams } from '@solidjs/router';
import API from '../../API';
import { Channel as ChannelType } from '../../discord';

// Style
import style from './css.module.css';
import { useAppState } from '../../AppState';
import { Tab } from '../../types';
import { CONSTANTS } from '../../Constants';
import { createMemo, createSignal, getOwner } from 'solid-js';
import ContextMenu, { useMenu } from '../ContextMenu/ContextMenu';
import OpenInNewTab from '../ContextMenuItems/OpenInNewTab';
import { Volume2 } from 'lucide-solid';

interface ChannelProps {
	data: ChannelType;
}

const Channel = (props: ChannelProps) => {
	const AppState = useAppState();
	const navigate = useNavigate();
	const params = useParams();
	const href = `/app/${props.data.guild_id}/${props.data.id}`;
	const guild = AppState.userGuilds.find((g) => g.properties.id === props.data.guild_id);
	const tab: Tab = {
		guildId: props.data.guild_id,
		channelId: props.data.id,
		channelName: props.data.name,
		channelType: props.data.type,
		guildIcon: guild.properties.icon,
		guildName: guild.properties.name,
	};
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

				API.addTab(tab);

				navigate(href);
				break;
		}
	}

	const chosenIcon = createMemo(() => {
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
				return <Volume2 />;
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
	});

	let openRef;
	return (
		<li class={style.channel} ref={openRef}>
			<button
				onMouseDown={(e) => {
					e.preventDefault();
					handleClick(e);
				}}
			>
				<div class={style.channelIcon}>{chosenIcon()}</div>
				<span>{displayName()}</span>
			</button>
			<ContextMenu data={{ channel: props.data }} openRef={openRef}>
				<OpenInNewTab />
			</ContextMenu>
		</li>
	);
};

export default Channel;
