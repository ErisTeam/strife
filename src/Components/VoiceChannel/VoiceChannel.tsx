import { useTabContext } from '../Tabs/TabUtils';
import style from './VoiceChannel.module.css';
import buttons from '../../Styles/Buttons.module.css';
import { gatewayOneTimeListener, messageCreate, startGatewayListener, startListener, useTaurListener } from '@/test';
import { useAppState } from '@/AppState';
import { event, invoke } from '@tauri-apps/api';
import { createStore, produce } from 'solid-js/store';
import { For } from 'solid-js';
import { createContextMenu } from '../ContextMenuNew/ContextMenu';
import { useMenu } from '../ContextMenu/ContextMenu';
function formatTime(date: Date) {
	return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
}

function Log(props: { date: Date; message: string }) {
	const contextMenu = createContextMenu({
		component: [
			() => {
				const menu = useMenu<{ message: string }>();
				return (
					<button
						onclick={() => {
							navigator.clipboard.writeText(menu.message);
							menu.closeMenu();
						}}
					>
						copy Message
					</button>
				);
			},
		],
		data: {
			message: props.message,
		},
	});
	return (
		<div use:contextMenu>
			<span class={style.time}>[{formatTime(props.date)}]</span>&nbsp{props.message}
		</div>
	);
}

export default () => {
	const tabContext = useTabContext();
	const AppState = useAppState();

	const [logs, setLogs] = createStore<{ date: Date; message: string }[]>([]);
	const gatewayListener = startListener('voice_gateway');
	gatewayListener.on<messageCreate>('voiceStateUpdate', (event) => {
		setLogs(logs.length, { date: new Date(), message: JSON.stringify(event) });
	});

	setLogs(logs.length, {
		date: new Date(),
		message:
			'Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus perspiciatis, itaque explicabo sunt iusto ex accusamus consectetur voluptates magnam ratione veniam laboriosam, odit, deserunt dolores quo impedit mollitia molestias suscipit! Iusto sit a aperiam reiciendis, voluptate sed, aliquid illo dolor totam modi ex fugit. Placeat perspiciatis quod sapiente, culpa, pariatur voluptatibus dolorem aut incidunt laudantium quasi minima. Voluptates nostrum ullam veniam atque veritatis nesciunt nulla provident rerum earum commodi distinctio ipsa corporis vel alias, error eligendi id ipsam. Repellat quos eligendi deserunt asperiores voluptates accusantium exercitationem? Corporis vero ea fugit. Sit deleniti voluptatem saepe ad itaque exercitationem, aliquid dolores inventore adipisci! Quis, quaerat delectus impedit necessitatibus expedita officia consectetur sint tempore natus a atque repellendus laborum voluptatibus omnis nulla iste, libero aspernatur, ratione similique magnam dolorum dignissimos. Voluptate exercitationem, distinctio doloremque accusantium nesciunt, itaque, adipisci culpa mollitia reprehenderit quasi excepturi quis voluptatum totam sit dignissimos dicta vel odit. Dolorum quo dolor dignissimos aspernatur veritatis aut sed, quidem eligendi facilis rem at incidunt officia, eos sunt voluptates fugit commodi quam! Molestias sed fugiat est ratione maiores dolore, incidunt consectetur debitis, quos voluptate explicabo veritatis aut possimus dicta iure itaque autem. Ipsam et consequuntur impedit est vitae doloremque earum dolore voluptates molestiae.',
	});
	setLogs(logs.length, {
		date: new Date(),
		message:
			'Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus perspiciatis, itaque explicabo sunt iusto ex accusamus consectetur voluptates magnam ratione veniam laboriosam, odit, deserunt dolores quo impedit mollitia molestias suscipit! Iusto sit a aperiam reiciendis, voluptate sed, aliquid illo dolor totam modi ex fugit. Placeat perspiciatis quod sapiente, culpa, pariatur voluptatibus dolorem aut incidunt laudantium quasi minima. Voluptates nostrum ullam veniam atque veritatis nesciunt nulla provident rerum earum commodi distinctio ipsa corporis vel alias, error eligendi id ipsam. Repellat quos eligendi deserunt asperiores voluptates accusantium exercitationem? Corporis vero ea fugit. Sit deleniti voluptatem saepe ad itaque exercitationem, aliquid dolores inventore adipisci! Quis, quaerat delectus impedit necessitatibus expedita officia consectetur sint tempore natus a atque repellendus laborum voluptatibus omnis nulla iste, libero aspernatur, ratione similique magnam dolorum dignissimos. Voluptate exercitationem, distinctio doloremque accusantium nesciunt, itaque, adipisci culpa mollitia reprehenderit quasi excepturi quis voluptatum totam sit dignissimos dicta vel odit. Dolorum quo dolor dignissimos aspernatur veritatis aut sed, quidem eligendi facilis rem at incidunt officia, eos sunt voluptates fugit commodi quam! Molestias sed fugiat est ratione maiores dolore, incidunt consectetur debitis, quos voluptate explicabo veritatis aut possimus dicta iure itaque autem. Ipsam et consequuntur impedit est vitae doloremque earum dolore voluptates molestiae.',
	});

	function log(...args: any[]) {
		setLogs(logs.length, {
			date: new Date(),
			message: JSON.stringify(args),
		});
		console.log(...args);
	}

	async function webrtc() {
		let peerConnection = new RTCPeerConnection({
			bundlePolicy: 'max-bundle',
		});
		peerConnection.ontrack = (event) => {
			log('ontrack', event);
		};
		let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
		const tracks = stream.getAudioTracks();
		log('tracks', tracks);
		tracks.forEach((track) => {
			const sender = peerConnection.addTrack(track, stream);
			log('sender', sender);
		});
		const offer = await peerConnection.createOffer();
		log('offer', offer);
	}

	async function startVoiceConnection() {
		console.log('startVoiceConnection', tabContext);
		await invoke('send_voice_state_update', {
			userId: AppState.userId(),
			guildId: tabContext.guildId,
			channelId: tabContext.channelId,
		});
		const voiceStateUpdate = await gatewayOneTimeListener(AppState.userId(), 'voiceStateUpdate');
		console.log('voiceStateUpdate', voiceStateUpdate);
		setLogs(logs.length, { date: new Date(), message: JSON.stringify(voiceStateUpdate) });
		const voiceServerUpdate = await gatewayOneTimeListener(AppState.userId(), 'voiceServerUpdate');
		console.log('voiceServerUpdate', voiceServerUpdate);
		setLogs(logs.length, { date: new Date(), message: JSON.stringify(voiceServerUpdate) });
		const res = await invoke('start_voice_gateway', {
			userId: AppState.userId,
			guildId: tabContext.guildId,
			endpoint: voiceServerUpdate.data.endpoint,
			voiceToken: voiceServerUpdate.data.token,
			sessionId: voiceStateUpdate.data.session_id,
		});
		console.log('res', res);
		setLogs(logs.length, { date: new Date(), message: JSON.stringify(res) });
	}
	return (
		<div>
			<h1>Voice Channel</h1>
			<h2>Current Tab: {JSON.stringify(tabContext)}</h2>
			<article class={style.controls}>
				<div>
					<button
						class={buttons.default}
						onclick={() => {
							startVoiceConnection();
						}}
					>
						Join channel
					</button>
					<button
						class={buttons.default}
						onclick={() => {
							webrtc();
						}}
					>
						webrtc
					</button>
				</div>
				<div class={style.sendContainer}>
					<textarea cols="30" rows="10" placeholder="message to send"></textarea>
					<button class={buttons.default}>Send to voice gateway</button>
				</div>
				<div class={style.logs}>
					<For each={logs}>
						{(log) => {
							return <Log date={log.date} message={log.message} />;
						}}
					</For>
				</div>
				<div>
					Status: <span></span>
				</div>
			</article>
		</div>
	);
};
