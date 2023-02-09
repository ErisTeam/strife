// SolidJS
import { createSignal, Show, onMount } from 'solid-js';
import {
	useParams,
	useBeforeLeave,
	BeforeLeaveEventArgs,
} from '@solidjs/router';

// API
import API from '../../API';

// Components
import ChannelList from '../../Components/ChannelList/ChannelList';
import RelationshipList from '../../Components/RelationshipList/RelationshipList';

// Styles
import style from './Application.module.css';

const Application = () => {
	const params = useParams();
	const [shouldRedner, setShouldRender] = createSignal(false);

	onMount(async () => {
		if (params.guildId == undefined) return;

		await API.updateCurrentChannels(params.guildId.toString());
		setShouldRender(true);
	});

	// TODO: Idk what this does, explain or delete it
	useBeforeLeave(async (e: BeforeLeaveEventArgs) => {
		const toGuild = e.to.toString().split('/')[2];

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
				<RelationshipList />
			</Show>
		</div>
	);
};

export default Application;
