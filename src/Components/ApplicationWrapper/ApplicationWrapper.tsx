import { Outlet } from '@solidjs/router';
import { Component, createSignal, Show, onMount, For } from 'solid-js';
import style from './ApplicationWrapper.module.css';
import { useAppState } from '../../AppState';

import GuildList from '../GuildList/GuildList';

const ApplicationWrapper = () => {
	const AppState: any = useAppState();

	return (
		<div class={style.wrapper}>
			<GuildList className={style.list} />
			<Outlet />
		</div>
	);
};
export default ApplicationWrapper;
