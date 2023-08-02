// API
import { useNavigate } from '@solidjs/router';
import { Channel as ChannelType } from '../../discord';

// Style
import style from './css.module.css';
import { useAppState } from '../../AppState';
import { TextChannelTab } from '../../types';
import { CONSTANTS } from '../../Constants';
import { Component, JSX, Match, Switch, createMemo, createSignal } from 'solid-js';

import OpenInNewTab from '../ContextMenuItems/OpenInNewTab';
import { Volume2 } from 'lucide-solid';
import { createContextMenu } from '../ContextMenuNew/ContextMenu';
import Chat from '../Messages/Chat';
import { Dynamic } from 'solid-js/web';

interface ChannelProps {
	data: ChannelType;
}

export default (props: ChannelProps) => {
	const AppState = useAppState();
	// const guild = AppState.userGuilds.find((g) => g.properties.id === props.data.guild_id);

	const [displayName, setDisplayName] = createSignal(props.data.name);

	const contextMenu = createContextMenu({ component: [OpenInNewTab], data: { channel: props.data } });

	function onMouseDown(e: MouseEvent) {
		e.preventDefault();
		console.log('clicked on', props.data.name, e.button, AppState);
		const tabS = AppState.Tabs.tabs.find(
			(t: any) => t.type === 'textChannel' && t.tabData?.channelId === props.data.id,
		);
		console.log('tabS', tabS);
		const tab: TextChannelTab = {
			type: 'textChannel',
			component: Chat,
			title: props.data.name,
			icon: channelIcon(),
			tabData: {
				channelId: props.data.id,
				guildId: props.data.guild_id,
			},
		};
		switch (e.button) {
			case 0:
				console.log('left click', e.button);
				console.log('tabS', tabS);
				if (tabS) {
					AppState.Tabs.setCurrentTab(AppState.Tabs.tabs.indexOf(tabS));
					return;
				}
				if (AppState.Tabs.currentTab() != -1) {
					console.log(tab);
					AppState.Tabs.replaceTab(AppState.Tabs.currentTab(), tab);
				} else {
					AppState.Tabs.addTab(tab, true);
					console.log(AppState.Tabs.currentTab());
				}
				break;
			case 1:
				console.log('middle click', e.button);
				if (tabS) {
					console.error('Tab already exists!');
					return;
				}
				AppState.Tabs.addTab(tab);
				break;
		}
	}

	const channelIcon = createMemo((): string | Component => {
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
				return Volume2;
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
			default:
				return '❓';
		}
	});

	let openRef;
	return (
		<>
			<li class={style.channel} ref={openRef} use:contextMenu>
				<button onMouseDown={onMouseDown}>
					<div class={style.channelIcon}>
						<Switch>
							<Match when={typeof channelIcon() === 'function'}>
								<Dynamic component={channelIcon()}></Dynamic>
							</Match>
							<Match when={typeof channelIcon() === 'string'}>{channelIcon() as string}</Match>
						</Switch>
					</div>
					<span title={displayName()}>{displayName()}</span>
				</button>
			</li>
		</>
	);
};
