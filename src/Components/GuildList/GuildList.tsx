import { Component, createSignal, Show, onMount, For } from 'solid-js';
import { useAppState } from '../../AppState';
import API from '../../API';

import Guild from '../Guild/Guild';
import style from './GuildList.module.css';
interface GuildListProps {
	className?: string;
}

const GuildList = (props: GuildListProps) => {
	const AppState: any = useAppState();

	onMount(async () => {
		API.updateGuilds();
	});

	return (
		<nav class={[props.className, style.guildList].join(' ')}>
			<ul>
				<For each={AppState.userGuilds()}>
					{(guild) => <Guild id={guild.id} />}
				</For>
			</ul>
		</nav>
	);
};
export default GuildList;
