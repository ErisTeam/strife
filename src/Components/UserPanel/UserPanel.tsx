// SolidJS
import { Outlet } from '@solidjs/router';
import { Match, Show, Switch, createEffect, createSignal, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
import ChannelList from '../Channels/ChannelList';

// Style
import style from './UserPanel.module.css';

//Icon
import { Settings } from 'lucide-solid';
import { MicIcon } from 'lucide-solid';
import { Headphones } from 'lucide-solid';
import { Video } from 'lucide-solid';

const UserPanel = () => {
	const AppState = useAppState();

	return (
		<div class={style.userPanelInner}>
			<div class={style.userInfo}>
				<div class={style.userAvatar}></div>
				<div class={style.userName}>User Name</div>
				<div class={style.userDiscriminator}>#1234</div>
			</div>
			<div class={style.userButtons}>
				<button class={style.userPanelButton}>
					<Settings></Settings>
				</button>
				<button class={style.userPanelButton}>
					<MicIcon></MicIcon>
				</button>
				<button class={style.userPanelButton}>
					<Headphones></Headphones>
				</button>
				<button class={style.userPanelButton}>
					<Video></Video>
				</button>
			</div>
		</div>
	);
};
export default UserPanel;
