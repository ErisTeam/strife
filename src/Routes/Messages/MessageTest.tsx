import { A } from '@solidjs/router';
import { createEffect, createResource, createSignal, For, Index, onCleanup } from 'solid-js';
import API from '../../API';
import { useAppState } from '../../AppState';
import { startGatewayListener, startGatewayListenerOld } from '../../test';
interface i {
	type: string;
}
interface messageCreate extends i {
	type: 'messageCreate';
	user_id: string;
	data: {
		content: string;
		author: {
			username: string;
		};
		id: string;
		timestamp: string;
	};
}

const channelId = '419544210027446276';

import style from './../../prev.module.css';

function MessageTest() {
	const [messages, setMessages] = createSignal<any[]>([]);

	const AppState = useAppState();

	const intl = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'short',
		timeStyle: 'medium',
	});

	(async () => {
		let res = await API.getMessages(channelId);
		console.log(res);
		setMessages((a) => [
			...a,
			...res
				.map((message: any) => ({
					...message,
					timestamp: new Date(message.timestamp),
				}))
				.reverse(),
		]);
	})();

	const listener = startGatewayListener(AppState.userID());

	listener.on<messageCreate>('messageCreate', (msg) => {
		console.log('Listener gateway', msg, msg, msg.type);
		if (messages().find((e) => e.id == msg.data.id)) {
			return;
		}
		setMessages((a) => [
			...a,
			{
				...msg.data,
				timestamp: new Date(msg.data.timestamp),
			},
		]);
	});

	// startGatewayListenerOld<messageCreate>(AppState.userID(), (msg) => {
	// 	console.log('gateway', msg, msg.payload, msg.payload.type);
	// 	switch (msg.payload.type) {
	// 		case 'messageCreate':
	// 			console.log('message create');
	// 			if (messages().find((e) => e.id == msg.id)) {
	// 				return;
	// 			}
	// 			setMessages((a) => [
	// 				...a,
	// 				{
	// 					...msg.payload.data,
	// 					timestamp: new Date(msg.payload.data.timestamp),
	// 				},
	// 			]);
	// 			console.log('message create');
	// 			console.log(messages());
	// 			break;

	// 		default:
	// 			console.log('default');
	// 			break;
	// 	}

	// 	console.log(msg.payload);
	// });

	// createEffect(async () => {
	// 	const l = startListener<messageCreate>('gateway',
	// 	onCleanup(async () => {
	// 		console.log('cleanup');
	// 		(await l)();
	// 	});
	// });
	const [canSendTyping, setCanSendTyping] = createSignal(true);
	async function sendTyping() {
		console.log('i');
		if (!canSendTyping()) {
			return;
		}
		console.log('send');
		setCanSendTyping(false);
		fetch(`https://discord.com/api/v9/channels/${channelId}/typing`, {
			method: 'POST',
			headers: {
				Authorization: (await API.getToken(AppState.userID())) as string,
			},
		});
		setTimeout(async () => {
			console.log('d');
			setCanSendTyping(true);
		}, 3000);
	}

	const [message, setMessage] = createSignal('');
	const [reference, setReference] = createSignal<null | any>(null);
	const [editing, setEditing] = createSignal<null | any>(null);

	return (
		<div>
			<A href="/">back</A>
			<ol style={{ 'overflow-y': 'auto', height: '60rem' }}>
				<For each={messages()} fallback={<h1>loading</h1>}>
					{(val, index) => {
						let embed;
						if (val.embeds && val.embeds[0]) {
							embed = (
								<video
									src={val.embeds[0].video.proxy_url}
									autoplay={true}
									loop={true}
									width={val.embeds[0].video.width}
									height={val.embeds[0].video.height}
								></video>
							);
						}
						return (
							<li>
								{intl.format(val.timestamp)} <br /> {val.author.username}: {!embed && val.content}
								{val.author.id == AppState.userID() && (
									<button
										class={style.button}
										onClick={() => {
											if (editing()?.id == val.id) {
												setEditing(null);
												return;
											}
											setEditing(val);
											setMessage(val.content);
											//setReference(val.)
										}}
									>
										edit
									</button>
								)}
								{embed}
								<button
									class={style.button}
									onClick={() => {
										if (reference()?.message_id == val.id) {
											setReference(null);
											return;
										}
										setReference({
											channel_id: val.channel_id,
											message_id: val.id,
											guild_id: '419544210027446273',
										});
									}}
								>
									reply
								</button>
							</li>
						);
					}}
				</For>
			</ol>
			<p>reply: {JSON.stringify(reference())}</p>
			<p>editing: {JSON.stringify(editing())}</p>
			<div>
				<input
					class={style.input}
					style={{ width: '60rem' }}
					type="text"
					oninput={(e) => {
						setMessage(e.currentTarget.value);
						sendTyping();
					}}
					placeholder="message"
					value={message()}
				/>

				<button
					class={style.button}
					onClick={async () => {
						let msg = message();
						setMessage('');
						let res = await API.sendMessage(channelId, msg, reference());
						if (messages().find((e) => e.id == res.id)) {
							return;
						}
						setMessages((a) => [
							...a,
							{
								...res,
								timestamp: new Date(res.timestamp),
							},
						]);
					}}
				>
					{editing() ? 'edit' : 'send'}
				</button>
			</div>
		</div>
	);
}
export default MessageTest;
