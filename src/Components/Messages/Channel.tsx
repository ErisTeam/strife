import { createStore } from 'solid-js/store';
import Message from './Message';
import { For, Show, createEffect, createSignal, onMount } from 'solid-js';
import { Message as MessageType } from '../../discord';
import API from '../../API';
import { useParams } from '@solidjs/router';
import { CONSTANTS } from '../../Constants';
import { useAppState } from '../../AppState';
import { invoke } from '@tauri-apps/api/tauri';

export default () => {
	const [messages, setMessages] = createStore<MessageType[]>([]);
	const [isVoiceChannel, setIsVoiceChannel] = createSignal(false);
	const AppState = useAppState();

	const params = useParams();

	async function fetchMessages() {
		const messages = await API.getMessages(params.channelId);
		setMessages(messages.reverse());
	}
	fetchMessages().catch(console.error);

	function updateMessage(updated: Partial<MessageType>) {
		setMessages((message) => message.id === updated.id, updated);
	}

	createEffect(() => {
		const channel = API.getChannelById(params.guildId, params.channelId);
		if (channel && channel.type == CONSTANTS.GUILD_VOICE) {
			console.log('voice channel');
			setIsVoiceChannel(true);
		}
		fetchMessages().catch(console.error);
	}, [params.channelId]);
	async function startVoice() {
		const voice_state = invoke('send_voice_state_update', {
			userId: AppState.userId(),
			guildId: params.guildId,
			channelId: params.channelId,
		});
		await voice_state;
		console.log('voice_state', voice_state);
	}
	return (
		<ol>
			<For each={messages}>{(message) => <Message message={message} updateMessage={updateMessage} />}</For>
			<Show when={isVoiceChannel()}>
				<button onclick={startVoice}>Join Voice Channel</button>
			</Show>
		</ol>
	);
};
