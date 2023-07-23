import { createStore } from 'solid-js/store';
import Message from './Message';
import { For } from 'solid-js';
import { Message as MessageType } from '../../discord';
import API from '../../API';
import { useParams } from '@solidjs/router';

export default () => {
	const [messages, setMessages] = createStore<MessageType[]>([]);

	const parms = useParams();

	async function fetchMessages() {
		const messages = await API.getMessages(parms.channelId);
		setMessages(messages.reverse());
	}
	fetchMessages().catch(console.error);

	function updateMessage(updated: Partial<MessageType>) {
		setMessages((message) => message.id === updated.id, updated);
	}

	return (
		<ol>
			<For each={messages}>{(message) => <Message message={message} updateMessage={updateMessage} />}</For>
		</ol>
	);
};
