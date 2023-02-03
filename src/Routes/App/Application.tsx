import { Component, createSignal, Show, onMount } from 'solid-js';
import { useAppState } from '../../AppState';

import style from './Application.module.css';
import API from '../../API';
import {
	useParams,
	useBeforeLeave,
	BeforeLeaveEventArgs,
} from '@solidjs/router';
import ChannelList from '../../Components/ChannelList/ChannelList';

const Application = () => {
	const AppState: any = useAppState();
	const params = useParams();
	const [shouldRedner, setShouldRender] = createSignal(false);
	onMount(async () => {
		await API.updateCurrentChannels(params.guildId.toString());
		setShouldRender(true);
	});
	useBeforeLeave(async (e: BeforeLeaveEventArgs) => {
		console.log(e.to);
		const toGuild = e.to.toString().split('/')[2];
		console.log(toGuild);
		if (toGuild != params.guildId.toString()) {
			setShouldRender(false);
			await API.updateCurrentChannels(toGuild);
			setShouldRender(true);
		}
	});

	return (
		<div class={style.app}>
			<Show when={shouldRedner()}>
				<ChannelList />
			</Show>
		</div>
	);
};
export default Application;
