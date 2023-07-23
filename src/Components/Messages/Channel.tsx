import { createStore } from 'solid-js/store';
import Message from './Message';
import { For, Show, createEffect, createSignal, onMount } from 'solid-js';
import { Message as MessageType } from '../../discord';
import API from '../../API';
import { useParams } from '@solidjs/router';
import { CONSTANTS } from '../../Constants';

export default () => {
	const [messages, setMessages] = createStore<MessageType[]>([]);
	const [isVoiceChannel, setIsVoiceChannel] = createSignal(false);

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
	return (
		<ol>
			<For each={messages}>{(message) => <Message message={message} updateMessage={updateMessage} />}</For>
			<Show when={isVoiceChannel()}>
				<button>Join Voice Channel</button>
			</Show>
		</ol>
	);
};
