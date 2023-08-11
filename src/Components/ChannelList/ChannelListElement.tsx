// API
import { useNavigate } from '@solidjs/router';
import { Channel as ChannelType } from '../../discord';

// Style
import style from './css.module.css';
import { useAppState } from '../../AppState';
import { CONSTANTS } from '../../Constants';
import { Component, JSX, Match, Switch, createMemo, createSignal } from 'solid-js';

import OpenInNewTab from '../ContextMenuItems/OpenInNewTab';
import { Volume2 } from 'lucide-solid';
import { createContextMenu } from '../ContextMenuNew/ContextMenu';
import Chat from '../Messages/Chat';
import { Dynamic } from 'solid-js/web';
import API from '../../API';
import { createTextChannelTab } from '../Tabs/TabUtils';
import { Tab } from '../../types';

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
		console.log('props.data', props.data);
		const inListIdx = AppState.tabs.findIndex((t: Tab) => t.id === props.data.id);
		console.log('inListIdx', inListIdx);
		const tab = createTextChannelTab(props.data);
		switch (e.button) {
			case 0:
				console.log('left click', e.button);

				if (inListIdx >= 0) {
					('Is Already on the list');
					API.Tabs.setAsCurrent(tab);

					return;
				}
				if (AppState.tabs.length === 0) {
					console.log('no tabs in list');
					API.Tabs.add(tab, true);
				} else {
					console.log('else');
					API.Tabs.add(tab, true);
				}
				break;
			case 1:
				console.log('middle click', e.button);
				if (inListIdx >= 0) {
					console.error('Tab already exists!');
					API.Tabs.setAsCurrent(tab);

					return;
				}
				API.Tabs.add(tab);
				break;
		}
	}

	const channelIcon = createMemo((): string | Component => {
		const { emoji, newName } = API.getChannelIcon(props.data);
		setDisplayName(newName);

		return emoji;
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
