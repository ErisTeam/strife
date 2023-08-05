import { createStore } from 'solid-js/store';

import Message from './Message';
import { For, Show, createEffect, createMemo, createSignal, onMount } from 'solid-js';
import { Message as MessageType } from '../../discord';
import API from '../../API';

import { useParams } from '@solidjs/router';

import { useAppState } from '../../AppState';
import { invoke } from '@tauri-apps/api/tauri';
import { gatewayOneTimeListener, useTaurListener } from '../../test';
import { CONSTANTS } from '../../Constants';
import style from './css.module.css';
import { useTabContext } from '../Tabs/Tabs';

type ChatProps = {
	channelId: string;
	guildId: string;
};
export default () => {
	const TabContext = useTabContext<ChatProps>();
	console.log('TabContext', TabContext);

	const [messages, setMessages] = createStore<MessageType[]>([]);
	const [isVoiceChannel, setIsVoiceChannel] = createSignal(false);
	const AppState = useAppState();

	async function fetchMessages() {
		const messages = await API.getMessages(TabContext.tabData.channelId);
		setMessages(messages.reverse());
	}
	fetchMessages().catch(console.error);

	function updateMessage(updated: Partial<MessageType>) {
		setMessages((message) => message.id === updated.id, updated);
	}
	onMount(() => {
		const channel = API.getChannelById(TabContext.tabData.guildId, TabContext.tabData.channelId);
		if (channel && channel.type == CONSTANTS.GUILD_VOICE) {
			console.log('voice channel');
			setIsVoiceChannel(true);
		}
		fetchMessages().catch(console.error);
	});
	async function startVoice() {
		await invoke('send_voice_state_update', {
			userId: AppState.userId(),
			guildId: TabContext.tabData.guildId,
			channelId: TabContext.tabData.channelId,
		});

		const listener = useTaurListener('voice_gateway', (event) => {
			console.log('event', event);
		});

		const voiceStateUpdate = await gatewayOneTimeListener(AppState.userId(), 'voiceStateUpdate');
		console.log('voice_state', voiceStateUpdate);
		const voiceServerUpdate = await gatewayOneTimeListener(AppState.userId(), 'voiceServerUpdate');
		console.log('voice_server', voiceServerUpdate);

		console.log(
			await invoke('start_voice_gateway', {
				userId: AppState.userId(),
				guildId: TabContext.tabData.guildId,
				endpoint: voiceServerUpdate.data.endpoint,
				voiceToken: voiceServerUpdate.data.token,
				sessionId: voiceStateUpdate.data.session_id,
			}),
		);

		window.sendToVoice = (data: string) => {
			console.log('sending', data);
			invoke('send_to_voice_gateway', { packet: JSON.stringify(data) });
		};

		// console.error('voice_server', voiceServerUpdate);
		// const serverId = voiceServerUpdate.data.guild_id;
		// const userId = voiceServerUpdate.userId;
		// const sessionId = voiceStateUpdate.data.session_id;
		// const token = voiceServerUpdate.data.token;
		// const endpoint = voiceServerUpdate.data.endpoint;
		// console.error('serverId', serverId, 'userId', userId, 'sessionId', sessionId, 'token', token, 'endpoint', endpoint);
		// const helloPayload = {
		// 	op: 0,
		// 	d: {
		// 		server_id: serverId,
		// 		user_id: userId,
		// 		session_id: sessionId,
		// 		token: token,
		// 	},
		// };

		// let heartbeatInterval: number;
		// let ip: string;
		// let modes: string[];
		// let port: number;
		// let ssrc: number;
		// let streams: any[];
		// let audio_codec: string;
		// let media_session_id: string;
		// let mode: string;
		// let secret_key: number[];
		// let video_codec: string;

		// const socket = new WebSocket(`wss://${endpoint}?v=4`);
		// socket.addEventListener('open', (event) => {
		// 	socket.send(JSON.stringify(helloPayload));
		// });

		// socket.addEventListener('message', (event) => {

		// 	const data = JSON.parse(event.data);
		// 	console.log('data', data);
		// 	if (data.op == 8) {
		// 		heartbeatInterval = data.d.heartbeat_interval;
		// 		console.log('heartbeatInterval', heartbeatInterval);
		// 		setInterval(async () => {
		// 			console.log('sending heartbeat');
		// 			const nonce = await generateNonce(secret_key.slice(0, 12));

		// 			socket.send(
		// 				JSON.stringify({
		// 					op: 3,
		// 					d: nonce,
		// 				})
		// 			);
		// 		}, heartbeatInterval);
		// 	}
		// 	if (data.op == 2) {
		// 		ip = data.d.ip;
		// 		modes = data.d.modes;
		// 		port = data.d.port;
		// 		ssrc = data.d.ssrc;
		// 		streams = data.d.streams;
		// 		console.log('ip', ip, 'modes', modes, 'port', port, 'ssrc', ssrc, 'streams', streams);

		// 		socket.send(
		// 			JSON.stringify({
		// 				op: 1,
		// 				d: {
		// 					protocol: 'udp',
		// 					data: {
		// 						address: ip,
		// 						port: port,
		// 						mode: modes[modes.length - 1],
		// 					},
		// 				},
		// 			})
		// 		);
		// 	}
		// 	if (data.op == 4) {
		// 		console.log("event", event);
		// 		audio_codec = data.d.audio_codec;
		// 		media_session_id = data.d.media_session_id;
		// 		mode = data.d.mode;
		// 		secret_key = data.d.secret_key;
		// 		video_codec = data.d.video_codec;

		// 	}
		// });
	}
	const [renderableMessages, setRenderableMessages] = createSignal([]);
	createEffect(() => {
		const renMsgs = [];
		let lastAuthor = '';

		for (let i = 0; i < messages.length; i++) {
			if (messages[i].author.id == lastAuthor) {
				renMsgs.push(<Message class={style.same} message={messages[i]} updateMessage={updateMessage} />);
			} else {
				renMsgs.push(<Message message={messages[i]} updateMessage={updateMessage} />);
				lastAuthor = messages[i].author.id;
			}
		}
		setRenderableMessages(renMsgs);
	});

	return (
		<ol class={style.chat}>
			{renderableMessages()}
			<Show when={isVoiceChannel()}>
				<button onclick={startVoice}>Join Voice Channel</button>
			</Show>
		</ol>
	);
};
