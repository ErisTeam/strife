// SolidJS
import { Outlet } from '@solidjs/router';
import { For, Index, Match, Show, Switch, createMemo, getOwner, onMount, runWithOwner } from 'solid-js';
import { useAppState } from '../../AppState';
import ChannelList from '../ChannelList/ChannelList';
// Components
import GuildList from '../Guild/GuildList';
import Tabs, { TabContextProvider } from '../Tabs/Tabs';

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

//TODO: move to routes
const ApplicationWrapper = () => {
	const AppState = useAppState();

	onMount(() => {
		// AppState.Tabs.addTab(
		// 	{
		// 		title: 'Welcome',
		// 		// component: WelcomeTab,
		// 		icon: '👋',
		// 		type: 'other',
		// 	},
		// 	true,
		// );
	});

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
						<Show when={AppState.Tabs.tabs.length > 0}>
							<Tabs className={style.tabs} />

							<For each={AppState.Tabs.tabs}>
								{(tab, index) => {
									console.log('tab', tab, index());
									return (
										<TabContextProvider tab={tab}>
											<div
												style={{ display: AppState.Tabs.currentTab() == index() ? null : 'none' }}
												class={style.outlet}
											>
												<Dynamic component={tab.component} {...tab.tabData} />
											</div>
										</TabContextProvider>
									);
								}}
							</For>
						</Show>
					</div>
				</div>
				<ControlPanel className={style.controlPanel} />
			</div>
		</ContextMenusProvider>
	);
};
export default ApplicationWrapper;
