// SolidJS
import { Outlet } from '@solidjs/router';
import { Show, createEffect, createSignal } from 'solid-js';
import { useAppState } from '../../AppState';
import ChannelList from '../ChannelList/ChannelList';
// Components
import GuildList from '../GuildList/GuildList';
import Tabs from '../Tabs/Tabs';

// Style
import style from './ApplicationWrapper.module.css';

const ApplicationWrapper = () => {
	const AppState: any = useAppState();
	const [classes, setClasses] = createSignal([style.wrapper]);
	createEffect(() => {
		if (AppState.currentGuild() == null && AppState.tabs().length < 1) {
			//without channel list and without tabs

			setClasses([style.wrapper, style.withoutAll]);
		} else if (AppState.currentGuild() != null && AppState.tabs().length > 0) {
			//with channel list and with tabs

			setClasses([style.wrapper, style.withAll]);
		} else if (AppState.currentGuild() != null && AppState.tabs().length < 1) {
			setClasses([style.wrapper, style.withoutTabs]);

			//with channel list and without tabs
		} else if (AppState.currentGuild() == null && AppState.tabs().length > 0) {
			setClasses([style.wrapper, style.withoutChannels]);

			//without channel list and with tabs
		}
	});

	return (
		<div class={classes().join(' ')}>
			<GuildList className={style.guilds} />
			<Show when={AppState.tabs().length > 0}>
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
