// SolidJS
import { Outlet } from '@solidjs/router';
import { Match, Show, Switch, createEffect, createSignal, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
import ChannelList from '../Channels/ChannelList';
// Components
import GuildList from '../Guild/GuildList';
import Tabs from '../Tabs/Tabs';
import ServerPanel from '../ServerPanel/ServerPanel';
import UserPanel from '../UserPanel/UserPanel';

// Style
import style from './ApplicationWrapper.module.css';
import { Portal } from 'solid-js/web';
import FriendsList from '../Friends/FriendsList';
import { User } from 'lucide-solid';

//TODO: move to routes

const ApplicationWrapper = () => {
	const AppState = useAppState();
	const [wrapperStyle, setWrapperStyle] = createSignal<string>('');
	createEffect(() => {
		if (!AppState.currentGuild()) {
			if (AppState.tabs.length == 0) {
				setWrapperStyle(style.withoutAll);
			} else {
				setWrapperStyle(style.withoutChannels);
			}
			return;
		} else {
			if (AppState.tabs.length == 0) {
				setWrapperStyle(style.withoutTabs);
			} else {
				setWrapperStyle(style.withAll);
			}
		}
	});

	console.log('CurrentGuild', !AppState.currentGuild());

	return (
		<div class={style.wrapper + ' ' + wrapperStyle()}>
			<div id="ContextMenu"></div>
			<GuildList className={style.guilds} />
			<Show when={AppState.tabs.length > 0}>
				<Tabs className={style.tabs} />
			</Show>
			<Show when={!!AppState.currentGuild()}>
				<Switch fallback={<ChannelList className={style.channels} />}>
					<Match when={AppState.currentGuild() == 'friends'}>
						<FriendsList className={style.channels} />
					</Match>
				</Switch>
			</Show>
			<div class={style.outlet}>
				<Outlet />
			</div>
			<div class={style.panel + ' ' + wrapperStyle()}>
				<UserPanel></UserPanel>
				<div class={style.panelDivider}></div>
				<ServerPanel></ServerPanel>
			</div>
		</div>
	);
};
export default ApplicationWrapper;
