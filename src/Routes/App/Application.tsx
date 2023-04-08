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

const Application = () => {
	const params = useParams();

	const AppState = useAppState();

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
			<Show when={AppState.currentGuild() != null}>
				<ChannelList />
			</Show>

			<RelationshipList />
			<Anchor state={'LoginScreen'} href="/">
				Prev
			</Anchor>
			<button
				onClick={async () => {
					API.updateGuilds();
				}}
			>
				Test
			</button>
		</div>
	);
};

export default Application;
