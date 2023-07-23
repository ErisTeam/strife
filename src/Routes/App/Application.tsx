import { A } from '@solidjs/router';
import { createEffect, createResource, createSignal, For, Index, onCleanup } from 'solid-js';
import { Portal } from 'solid-js/web';
import API from '../../API';
import { useAppState } from '../../AppState';
import { Listener, startGateway, startGatewayListener } from '../../test';
import { useParams } from '@solidjs/router';
import Dev from '../../Components/Dev/Dev';
import { emit } from '@tauri-apps/api/event';
import Message from '../../Components/Messages/Message';
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

const Application = () => {
	const params = useParams();

	const [messages, setMessages] = createSignal<any[]>([], { equals: false });
	const [message, setMessage] = createSignal('');
	const [reference, setReference] = createSignal<null | any>(null);
	const [editing, setEditing] = createSignal<null | any>(null);
	const AppState = useAppState();

	startGateway(AppState.userId());

	const intl = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'short',
		timeStyle: 'medium',
	});
	createEffect(async () => {
		fetchMessages();
	}, [params.channelId]);

	async function fetchMessages() {
		console.log('aaa', params, params.channelId);
		if (!params.channelId) {
			console.log('no channel id');
			return;
		}
		const res = await API.getMessages(params.channelId);
		console.log(res);
		const r = res
			.map((message: any) => ({
				...message,
				timestamp: new Date(message.timestamp),
			}))
			.reverse();
		console.log(r);

		setMessages(r);
	}

	fetchMessages();

	const listener = startGatewayListener(AppState.userId());

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
	listener.on<messageCreate>('messageUpdate', (msg) => {
		console.log('Listener gateway', msg, msg, msg.type);
		setMessages((clone) => {
			//let clone = [...a];
			const index = clone.findIndex((e) => e.id == msg.data.id);

			if (index == -1) {
				return clone;
			}
			console.log('first', clone[index]);
			//clone array
			clone[index] = {
				...msg.data,
				timestamp: new Date(msg.data.timestamp),
			};
			console.log(clone[index]);

			return clone;
		});
	});

	listener.on('typing', (msg) => {
		console.log('typing', msg);
	});

	const [shouldSendTyping, setShouldSendTyping] = createSignal(true);
	async function sendTyping() {
		console.log('i');
		if (!shouldSendTyping()) {
			return;
		}
		console.log('send');
		setShouldSendTyping(false);
		fetch(`https://discord.com/api/v9/channels/${params.channelId}/typing`, {
			method: 'POST',
			headers: {
				Authorization: await API.getToken(AppState.userId()),
			},
		});
		setTimeout(async () => {
			console.log('d');
			setShouldSendTyping(true);
		}, 3000);
	}

	return (
		<div>
			<Dev>
				<div>
					{params.guildId} -- {params.channelId}
					<button
						onclick={() => {
							fetchMessages();
						}}
					>
						update Messages
					</button>
					<button
						onclick={async () => {
							console.log(`activating user ${AppState.userId()}`);
							await emit('activateUser', { userId: AppState.userId() });
						}}
					>
						Activate User
					</button>
				</div>
			</Dev>
			<ol style={{ 'overflow-y': 'auto', height: '60rem' }}>
				<For each={messages()} fallback={<h1>loading</h1>}>
					{(val) => {
						return (
							<Message
								message={val}
								setEditing={setEditing}
								setMessage={setMessage}
								editing={editing}
								reference={reference}
								setReference={setReference}
							/>
						);
					}}
				</For>
			</ol>
			<p>reply: {JSON.stringify(reference())}</p>
			<p>editing: {JSON.stringify(editing())}</p>
			<div>
				<input
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
					onClick={async () => {
						const msg = message();
						setMessage('');
						if (editing()) {
							const res = await API.editMessage(params.channelId, editing().id, msg);
							setEditing(null);
							setMessages((a) => {
								const index = a.findIndex((e) => e.id == res.id);
								if (index == -1) {
									return a;
								}
								a[index] = {
									...res,
									timestamp: new Date(res.timestamp),
								};
								return a;
							});
						} else {
							const res = await API.sendMessage(params.channelId, msg, reference());
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
						}
					}}
				>
					{editing() ? 'edit' : 'send'}
				</button>
			</div>
		</div>
	);
};

export default Application;
