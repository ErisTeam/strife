// SolidJS

import { Match, Show, Switch, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
import ChannelList from '../ChannelList/ChannelList';
// Components
import GuildList from '../Guild/GuildList';
import TabWindow from '../Tabs/TabWindow';

// Style
import FriendsList from '../Friends/FriendsList';
import style from './Application.module.css';

import { ContextMenusProvider } from '../ContextMenuNew/ContextMenu';
import ControlPanel from '../ControlPanel/ControlPanel';

import { Guild } from '../../discord';
import Dev from '../Dev/Dev';

import API from '../../API';

//TODO: move to routes
const Application = () => {
	const AppState = useAppState();

	onMount(() => {
		API.Tabs.loadFromFile()
			.then((result) => {
				if (!result) {
					API.Tabs.add(
						{
							title: 'Welcome',
							component: 'welcomeTab',
							icon: '👋',
						},
						true,
					);
				}
			})
			.catch(console.error);
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
export default Application;
