// SolidJS

import { Show, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
// Components
import GuildList from '../Guild/GuildList';

// Style
import style from './Application.module.css';

import { ContextMenusProvider } from '../ContextMenuNew/ContextMenu';
import ControlPanel from '../ControlPanel/ControlPanel';

import Dev from '../Dev/Dev';

import { Guild } from '../../types/Guild';
import ChannelList from '../ChannelList/ChannelList';
import FriendsList from '../Friends/FriendsList';
import TabWindow from '../Tabs/TabWindow';
import { add, findByComponent, loadFromFile, swapOrderByIdx } from '@/API/Tabs';

//TODO: move to routes
const Application = () => {
	const AppState = useAppState();

	onMount(() => {
		loadFromFile()
			.then((result) => {
				if (!result) {
					add(
						{
							title: 'Welcome',
							component: 'welcomeTab',
							icon: '👋',
						},
						true,
					);
				}
				if (findByComponent('settings') == -1) {
					add({
						component: 'settings',
						title: 'Settings',
						icon: '⚙️',
					});
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
						swapOrderByIdx(0, 1);
					}}
				>
					Ordering Test
				</button>
			</Dev>

			<div class={style.wrapper}>
				<GuildList className={style.guilds} />
				<div class={style.outer}>
					<div id="ContextMenu" />

					<Show when={!!AppState.currentGuild()}>
						<Show
							when={AppState.currentGuild() == 'friends'}
							fallback={<ChannelList className={style.channels} guild={AppState.currentGuild() as Guild} />}
						>
							<FriendsList className={style.channels} />
						</Show>
					</Show>

					<TabWindow className={style.inner} />
				</div>
				<ControlPanel className={style.controlPanel} />
			</div>
		</ContextMenusProvider>
	);
};
export default Application;
