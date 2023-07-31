// SolidJS
import { Outlet } from '@solidjs/router';
import { Match, Show, Switch } from 'solid-js';
import { useAppState } from '../../AppState';
import ChannelList from '../ChannelList/ChannelList';
// Components
import GuildList from '../Guild/GuildList';
import Tabs from '../Tabs/Tabs';

// Style
import style from './ApplicationWrapper.module.css';
import FriendsList from '../Friends/FriendsList';

import ControlPanel from '../ControlPanel/ControlPanel';

//TODO: move to routes

const ApplicationWrapper = () => {
	const AppState = useAppState();

	console.log('CurrentGuild', !AppState.currentGuild());

	return (
		<div class={style.wrapper}>
			<div class={style.outer}>
				<div id="ContextMenu" />
				<GuildList className={style.guilds} />

				<Show when={!!AppState.currentGuild()}>
					<Switch fallback={<ChannelList className={style.channels} />}>
						<Match when={AppState.currentGuild() == 'friends'}>
							<FriendsList className={style.channels} />
						</Match>
					</Switch>
				</Show>
				<div class={style.inner}>
					<Show when={AppState.tabs.length > 0}>
						<Tabs className={style.tabs} />
					</Show>
					<div class={style.outlet}>
						<Outlet />
					</div>
				</div>
			</div>
			<ControlPanel className={style.controlPanel} />
		</div>
	);
};
export default ApplicationWrapper;
