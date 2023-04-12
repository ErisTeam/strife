// SolidJS
import { createSignal, Show, onMount } from 'solid-js';
import { useParams, useBeforeLeave, BeforeLeaveEventArgs } from '@solidjs/router';

// API
import API from '../../API';

// Components
import ChannelList from '../../Components/ChannelList/ChannelList';
import RelationshipList from '../../Components/RelationshipList/RelationshipList';

// Styles
import style from './Application.module.css';

import Anchor from '../../Components/Anchor/Anchor';
import { Portal } from 'solid-js/web';
import { useAppState } from '../../AppState';
import Tabs from '../../Components/Tabs/Tabs';

const Application = () => {
	const params = useParams();

	const AppState = useAppState();
	let currentGuildId = params.guildId;
	let currentChannelId = params.channelId;

	// TODO: Idk what this does, explain or delete it
	// useBeforeLeave(async (e: BeforeLeaveEventArgs) => {
	// 	const toGuild = e.to.toString().split('/')[2];

	// 	if (toGuild != params.guildId.toString()) {
	// 		setShouldRender(false);
	// 		await toGuild;
	// 		setShouldRender(true);
	// 	}
	// });

	return (
		<div class={style.app}>
			<Portal mount={document.querySelector('.dev') as Node}>
				<button
					onclick={async (e) => {
						console.log(await API.updateGuilds());
					}}
				>
					Update Guilds
				</button>
			</Portal>
			<Tabs />
			<Show when={AppState.currentGuild() != null}>
				<ChannelList />
			</Show>
			<h1>
				Current Channel:{' '}
				{
					AppState.userGuilds()
						.find((x) => {
							return x.id == currentGuildId;
						})
						?.channels.find((x) => {
							return x.id == currentChannelId;
						})?.name
				}
			</h1>
			<RelationshipList />
		</div>
	);
};

export default Application;
