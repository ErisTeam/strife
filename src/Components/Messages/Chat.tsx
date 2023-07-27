import { createStore } from 'solid-js/store';

import Message from './Message';
import { For, Show, createEffect, createSignal, onMount } from 'solid-js';
import { ChannelType, Message as MessageType } from '../../discord';
import API from '../../API';
import _sodium from 'libsodium-wrappers';
import { useParams } from '@solidjs/router';

import { useAppState } from '../../AppState';
import { invoke } from '@tauri-apps/api/tauri';
import { gatewayOneTimeListener } from '../../test';
import { CONSTANTS } from '../../Constants';
import style from './css.module.css';

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
	async function generateNonce(RTPHeader: number[]) {
		await _sodium.ready;
		const sodium = _sodium;
		const nonce = new Uint8Array(24);
		nonce.set(RTPHeader.slice(0, 12));
		nonce.set(sodium.randombytes_buf(12), 12);
		return nonce;
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
		await invoke('send_voice_state_update', {
			userId: AppState.userId(),
			guildId: params.guildId,
			channelId: params.channelId,
		});

		const voiceStateUpdate = await gatewayOneTimeListener(AppState.userId(), 'voiceStateUpdate');
		console.error('voice_state', voiceStateUpdate);
		const voiceServerUpdate = await gatewayOneTimeListener(AppState.userId(), 'voiceServerUpdate');
		console.error('voice_server', voiceServerUpdate);
		const serverId = voiceServerUpdate.data.guild_id;
		const userId = voiceServerUpdate.userId;
		const sessionId = voiceStateUpdate.data.session_id;
		const token = voiceServerUpdate.data.token;
		const endpoint = voiceServerUpdate.data.endpoint;
		console.error('serverId', serverId, 'userId', userId, 'sessionId', sessionId, 'token', token, 'endpoint', endpoint);
		const helloPayload = {
			op: 0,
			d: {
				server_id: serverId,
				user_id: userId,
				session_id: sessionId,
				token: token,
			},
		};

		let heartbeatInterval: number;
		let ip: string;
		let modes: string[];
		let port: number;
		let ssrc: number;
		let streams: any[];
		let audio_codec: string;
		let media_session_id: string;
		let mode: string;
		let secret_key: number[];
		let video_codec: string;

		const socket = new WebSocket(`wss://${endpoint}?v=4`);
		socket.addEventListener('open', (event) => {
			socket.send(JSON.stringify(helloPayload));
		});

		socket.addEventListener('message', (event) => {
			const data = JSON.parse(event.data);
			console.log('data', data);
			if (data.op == 8) {
				heartbeatInterval = data.d.heartbeat_interval;
				console.log('heartbeatInterval', heartbeatInterval);
				setInterval(async () => {
					console.log('sending heartbeat');
					const nonce = await generateNonce(secret_key.slice(0, 12));

					socket.send(
						JSON.stringify({
							op: 3,
							d: nonce,
						}),
					);
				}, heartbeatInterval);
			}
			if (data.op == 2) {
				ip = data.d.ip;
				modes = data.d.modes;
				port = data.d.port;
				ssrc = data.d.ssrc;
				streams = data.d.streams;
				console.log('ip', ip, 'modes', modes, 'port', port, 'ssrc', ssrc, 'streams', streams);

				socket.send(
					JSON.stringify({
						op: 1,
						d: {
							protocol: 'udp',
							data: {
								address: ip,
								port: port,
								mode: modes[modes.length - 1],
							},
						},
					}),
				);
			}
			if (data.op == 4) {
				console.log('event', event);
				audio_codec = data.d.audio_codec;
				media_session_id = data.d.media_session_id;
				mode = data.d.mode;
				secret_key = data.d.secret_key;
				video_codec = data.d.video_codec;
			}
		});
	}
	return (
		<ol class={style.chat}>
			<For each={messages}>{(message) => <Message message={message} updateMessage={updateMessage} />}</For>
			<Show when={isVoiceChannel()}>
				<button onclick={startVoice}>Join Voice Channel</button>
			</Show>
		</ol>
	);
};
