import { convertFileSrc, invoke } from '@tauri-apps/api/tauri';
import { For, Show, createEffect, createMemo, createResource, createSignal, onMount } from 'solid-js';
import API from '../../API';
import { useAppState } from '../../AppState';
import { CONSTANTS } from '../../Constants';
import { Message as MessageType } from '../../types/Messages';
import { gatewayOneTimeListener, startGatewayListener, useTaurListener } from '../../test';
import { useTabContext } from '../Tabs/TabUtils';
import { open } from '@tauri-apps/api/dialog';
import Message from './Message';
import style from './css.module.css';
import MessageEditor from './MessageEditor';
import MessageSender from './MessageSender';
import { listen } from '@tauri-apps/api/event';

export type UploadFile =
	| string
	| {
			name: string;
			blob?: Blob;
			attachmentId?: string;
	  };
export default function Chat() {
	const TabContext = useTabContext();
	console.log('TabContext', TabContext);
	const AppState = useAppState();
	let chatref: HTMLOListElement;

	const [files, setFiles] = createSignal<UploadFile[]>([]);

	//TODO: make it possible to select multiple characters

	function scrollToBottom() {
		chatref.scrollTo(0, chatref.scrollHeight);
	}
	const listener = startGatewayListener(AppState.userId);
	listener.on<any>('messageCreate', (event) => {
		console.log(TabContext.channelId, event.data.channel_id, event.data.content);
		if (event.data.channel_id === TabContext.channelId) {
			const newMessage = {
				id: event.data.id,
				channel_id: event.data.channel_id,
				content: event.data.content,
				timestamp: event.data.timestamp,
				author: event.data.author,
				embeds: event.data.embeds,
				attachments: event.data.attachments,
				mentions: event.data.mentions,
				mention_roles: event.data.mention_roles,
			} as MessageType;

			let isAtBottom = false;
			if (chatref.scrollTop + chatref.clientHeight >= chatref.scrollHeight) {
				isAtBottom = true;
			}
			console.log('newMessage', newMessage);
			setMessages(messages().concat(newMessage));

			if (isAtBottom) {
				scrollToBottom();
			}
		}
	});

	const [isVoiceChannel, setIsVoiceChannel] = createSignal(false);

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
	const [isDragging, setIsDragging] = createSignal(false);
	let lastAuthor = '';

	let mainref: HTMLDivElement;

	onMount(() => {
		// const channel = API.getChannelById(TabContext.guildId, TabContext.type); //TODO: Move VoiceChannels to their own component
		// if (channel && channel.type == CONSTANTS.GUILD_VOICE) {
		// 	console.log('voice channel');
		// 	setIsVoiceChannel(true);
		// }

		mainref.ondrop = (e) => {
			e.preventDefault();
			console.log('drop', e);
			const files = e.dataTransfer.files;
			console.log('files', files);
			for (let i = 0; i < files.length; i++) {
				let blob = files[i];
				let fileName = blob.name;
				setFiles((files) => [...files, { name: fileName, blob: blob }]);
			}
			setIsDragging(false);
		};
		mainref.ondragenter = (e) => {
			e.preventDefault();
			console.log('dragenter', e);

			setIsDragging(true);
		};
		mainref.ondragend = (e) => {
			e.preventDefault();
			console.log('dragend', e);
			setIsDragging(false);
		};

		mainref.ondragleave = (e: DragEvent | MouseEvent) => {
			e.preventDefault();
			if (!mainref.contains(e.relatedTarget as Node)) {
				setIsDragging(false);
			}
		};

		scrollToBottom();
	});

	return (
		<main class={style.main} classList={{ [style.fileDrop]: isDragging() }} ref={mainref}>
			<ol class={style.TEST} ref={chatref}>
				<For each={messages()}>
					{(message) => {
						if (message.author.id == lastAuthor) {
							return <Message same={true} message={message} updateMessage={updateMessage} />;
						} else {
							lastAuthor = message.author.id as string;
							return <Message message={message} updateMessage={updateMessage} />;
						}
					}}
				</For>
			</ol>

			<MessageSender files={files} setFiles={setFiles} channelId={TabContext.channelId} />
		</main>
	);
}
