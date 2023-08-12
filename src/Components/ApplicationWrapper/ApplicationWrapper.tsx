// SolidJS

import { For, Match, Show, Switch, createMemo, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
import ChannelList from '../ChannelList/ChannelList';
// Components
import GuildList from '../Guild/GuildList';
import TabWindow from '../Tabs/TabWindow';

// Style
import style from './ApplicationWrapper.module.css';
import FriendsList from '../Friends/FriendsList';

import ControlPanel from '../ControlPanel/ControlPanel';
import { ContextMenusProvider } from '../ContextMenuNew/ContextMenu';
import { Dynamic } from 'solid-js/web';
import Dev from '../Dev/Dev';
import { Guild } from '../../discord';
import { unwrap } from 'solid-js/store';
import WelcomeTab from '../Tabs/WelcomeTab';
import { DragDropDebugger, DragDropProvider, DragDropSensors, SortableProvider } from '@thisbeyond/solid-dnd';
import API from '../../API';

//TODO: move to routes
const ApplicationWrapper = () => {
	const AppState = useAppState();

	onMount(() => {
		API.Tabs.add(
			{
				title: 'Welcome',
				component: 'welcomeTab',
				icon: '👋',
			},
			true,
		);
	});

	console.log('CurrentGuild', !AppState.currentGuild());

	return (
		<ContextMenusProvider>
			<Dev>
				<button
					onclick={() => {
						API.Tabs.swapOrderByIdx(0, 1);
					}}
				>
					Ordering Test
				</button>
			</Dev>

			<div class={style.wrapper}>
				<div class={style.outer}>
					<div id="ContextMenu" />
					<GuildList className={style.guilds} />

					<Show when={!!AppState.currentGuild()}>
						<Switch fallback={<ChannelList className={style.channels} guild={AppState.currentGuild() as Guild} />}>
							<Match when={AppState.currentGuild() == 'friends'}>
								<FriendsList className={style.channels} />
							</Match>
						</Switch>
					</Show>
					<div class={style.inner}>
						<TabWindow />
					</div>
				</div>
				<ControlPanel className={style.controlPanel} />
			</div>
		</ContextMenusProvider>
	);
};
export default ApplicationWrapper;
