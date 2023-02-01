import { Component, createSignal, Show, onMount, For } from 'solid-js';
import { useAppState } from '../../AppState';
import API from '../../API';

import Guild from '../Guild/Guild';
const GuildList = () => {
	const AppState: any = useAppState();

	onMount(async () => {
		API.updateGuilds();
	});

	return (
		<nav>
			<ul>
				<For each={AppState.userGuilds()}>
					{(guild) => <Guild id={guild.id} />}
				</For>
			</ul>
		</nav>
	);
};
export default GuildList;
