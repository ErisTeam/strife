// API
import { Channel as ChannelType } from '../../types/Channel';

// Style
import style from './css.module.css';
import { useAppState } from '../../AppState';
import { Component, JSX, Match, Switch, createMemo, createSignal } from 'solid-js';
import OpenInNewTab from '../ContextMenuItems/OpenInNewTab';
import { createContextMenu } from '../ContextMenuNew/ContextMenu';
import { Dynamic } from 'solid-js/web';
import { createTextChannelTab } from '../Tabs/TabUtils';
import { Tab } from '../../types';
import { add, setAsCurrent } from '@/API/Tabs';
import { getChannelIcon } from '@/API/Channels';

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

		const listIndex = AppState.tabs.findIndex((t: Tab) => t.component == 'textChannel' && t.channelId == props.data.id);

		console.log('listIndex', listIndex);
		const tab = createTextChannelTab(props.data);
		switch (e.button) {
			case 0:
				console.log('left click', e.button);
				if (listIndex == -1) {
					add(tab, true);
				} else {
					setAsCurrent(listIndex);
				}
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

	const channelIcon = createMemo((): string | Component => {
		const { emoji, newName } = getChannelIcon(props.data);
		setDisplayName(newName);
		console.log('emoji', emoji);

		return emoji;
	});

	let openRef;
	return (
		<>
			<li class={style.channel} ref={openRef} use:contextMenu>
				<button onMouseDown={onMouseDown}>
					<div class={style.channelIcon}>
						<Switch>
							<Match when={typeof channelIcon() == 'function'}>
								<Dynamic component={channelIcon()}></Dynamic>
							</Match>
							<Match when={typeof channelIcon() == 'string'}>{channelIcon() as string}</Match>
						</Switch>
					</div>
					<span title={displayName()}>{displayName()}</span>
				</button>
			</li>
		</>
	);
};
