// SolidJS
import { Outlet } from '@solidjs/router';
import { Show, createEffect, createSignal, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
import ChannelList from '../Channels/ChannelList';
// Components
import GuildList from '../Guild/GuildList';
import Tabs from '../Tabs/Tabs';

// Style
import style from './ApplicationWrapper.module.css';
import { Portal } from 'solid-js/web';

//TODO: move to routes

const ApplicationWrapper = () => {
	const AppState: any = useAppState();
	const [wrapperStyle, setWrapperStyle] = createSignal<string>('');
	createEffect(() => {
		if (AppState.currentGuild() == null && AppState.tabs.length < 1) {
			setWrapperStyle(style.withoutAll);
		} else if (AppState.currentGuild() != null && AppState.tabs.length > 0) {
			setWrapperStyle(style.withAll);
		} else if (AppState.currentGuild() != null && AppState.tabs.length < 1) {
			setWrapperStyle(style.withoutTabs);
		} else if (AppState.currentGuild() == null && AppState.tabs.length > 0) {
			setWrapperStyle(style.withoutChannels);
		}
	});

	return (
		<div class={style.wrapper + ' ' + wrapperStyle()}>
			<div id="ContextMenu"></div>
			<GuildList className={style.guilds} />
			<Show when={AppState.tabs.length > 0}>
				<Tabs className={style.tabs} />
			</Show>
			<Show when={AppState.currentGuild() != null}>
				<ChannelList className={style.channels} />
			</Show>
			<div class={style.outlet}>
				<Outlet />
			</div>
		</div>
	);
};
export default ApplicationWrapper;
