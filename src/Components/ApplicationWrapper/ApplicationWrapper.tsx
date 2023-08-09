// SolidJS

import { For, Match, Show, Switch, createMemo, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
import ChannelList from '../ChannelList/ChannelList';
// Components
import GuildList from '../Guild/GuildList';
import TabBar, { TabContextProvider, Tabs } from '../Tabs/Tabs';

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

//TODO: move to routes
const ApplicationWrapper = () => {
	const AppState = useAppState();

	AppState.Tabs.addTab(
		{
			title: 'Welcome',
			component: WelcomeTab,
			icon: '👋',
			type: 'other',
		},
		true,
	);

	console.log('CurrentGuild', !AppState.currentGuild());

	return (
		<ContextMenusProvider>
			<Dev>
				<button
					onclick={() => {
						console.log('add test tab', AppState.currentGuild() as Guild);
						AppState.Tabs.addTab({
							type: 'other',
							component: ChannelList,
							tabData: {
								guild: unwrap(AppState.currentGuild() as Guild),
							},
							title: 'Test',
						});
					}}
				>
					Add test Tab
				</button>
				<button
					onclick={() => {
						AppState.Tabs.changeOrder(0, 1);
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
						<Tabs />
					</div>
				</div>
				<ControlPanel className={style.controlPanel} />
			</div>
		</ContextMenusProvider>
	);
};
export default ApplicationWrapper;
