import Message from './Message';
import { For, Show, createMemo, createResource, createSignal, lazy, onMount } from 'solid-js';
import { Message as MessageType } from '../../discord';
import API from '../../API';
import { useAppState } from '../../AppState';
import { invoke } from '@tauri-apps/api/tauri';
import { gatewayOneTimeListener, useTaurListener } from '../../test';
import { CONSTANTS } from '../../Constants';
import style from './css.module.css';
import { useTabContext } from '../Tabs/TabUtils';
import { Tab } from '../../types';

export default function Chat() {
	const TabContext = useTabContext();
	console.log('TabContext', TabContext);

	const [isVoiceChannel, setIsVoiceChannel] = createSignal(false);
	const AppState = useAppState();

	const [messages, { mutate: setMessages }] = createResource(async () => {
		const messages = await API.getMessages(TabContext.channelId);
		return messages.reverse();
	});

	function updateMessage(updated: Partial<MessageType>) {
		setMessages((messages) => {
			const index = messages.findIndex((message) => message.id == updated.id);
			if (index == -1) return messages;
			messages[index] = { ...messages[index], ...updated };
			return messages;
		});
	}
	onMount(() => {
		const channel = API.getChannelById(TabContext.guildId, TabContext.type); //TODO: Move VoiceChannels to their own component
		if (channel && channel.type == CONSTANTS.GUILD_VOICE) {
			console.log('voice channel');
			setIsVoiceChannel(true);
		}
	});
	async function startVoice() {
		await invoke('send_voice_state_update', {
			userId: AppState.userId,
			guildId: TabContext.tab.guildId,
			channelId: TabContext.tab.guildId,
		});

		const listener = useTaurListener('voice_gateway', (event) => {
			console.log('event', event);
		});

		const voiceStateUpdate = await gatewayOneTimeListener(AppState.userId, 'voiceStateUpdate');
		console.log('voice_state', voiceStateUpdate);
		const voiceServerUpdate = await gatewayOneTimeListener(AppState.userId, 'voiceServerUpdate');
		console.log('voice_server', voiceServerUpdate);

		console.log(
			await invoke('start_voice_gateway', {
				userId: AppState.userId,
				guildId: TabContext.guildId,
				endpoint: voiceServerUpdate.data.endpoint,
				voiceToken: voiceServerUpdate.data.token,
				sessionId: voiceStateUpdate.data.session_id,
			}),
		);

		window.sendToVoice = (data: string) => {
			console.log('sending', data);
			invoke('send_to_voice_gateway', { packet: JSON.stringify(data) });
		};
	}
	const renderableMessages = createMemo(() => {
		const renderableMessages = [];
		let lastAuthor = '';

		const messagesToRender = messages();
		if (!messagesToRender) return [];
		console.log('messagesToRender', messagesToRender);
		for (let i = 0; i < messagesToRender.length; i++) {
			if (
				messagesToRender[i].author.id == lastAuthor
				//&& messagesToRender[i].timestamp - messagesToRender[i - 1].timestamp < 1000 * 60 * 7
			) {
				renderableMessages.push(
					<Message class={style.same} message={messagesToRender[i]} updateMessage={updateMessage} />,
				);
			} else {
				renderableMessages.push(<Message message={messagesToRender[i]} updateMessage={updateMessage} />);
				lastAuthor = messagesToRender[i].author.id;
			}
		}
		console.log('renderableMessages', renderableMessages);
		return renderableMessages;
	});

	return (
		<ol class={style.chat}>
			{renderableMessages()}
			<Show when={isVoiceChannel()}>
				<button onclick={startVoice}>Join Voice Channel</button>
			</Show>
		</ol>
	);
}
