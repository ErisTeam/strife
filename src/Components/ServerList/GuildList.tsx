import { Component, createSignal, Show, onMount, For } from 'solid-js';
import { useAppState } from '../../AppState';
import API from '../../API';

const GuildList = () => {
	const AppState: any = useAppState();

	onMount(async () => {
		API.updateGuilds();
	});

	return (
		<nav>
			<ul>
				<For each={AppState.userGuilds()}>
					{(guild) => (
						<li>
							<a href={`/app/${guild.id}`}>{guild.name}</a>
						</li>
					)}
				</For>
			</ul>
		</nav>
	);
};
export default GuildList;
