import { A } from '@solidjs/router';
import { createSignal, For } from 'solid-js';
import API from '../../../API';
import { useAppState } from '../../../AppState';
import { startGateway, startGatewayListener } from '../../../test';
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

import style from '../prev.module.css';
import Dev from '../../../Components/Dev/Dev';

function MessageTest(props: { channelId?: string; guildId?: string }) {
	const [channelId, setChannelId] = createSignal(props.channelId || '419544210027446276');
	const [guildId, setGuildId] = createSignal(props.guildId || '419544210027446273');

	const [messages, setMessages] = createSignal<any[]>([], { equals: false });

	const AppState = useAppState();

	startGateway(AppState.userId() as string);

	const intl = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'short',
		timeStyle: 'medium',
	});

	async function fetchMessages() {
		const res = await API.getMessages(channelId());
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

	const listener = startGatewayListener(AppState.userId() as string);

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
		fetch(`https://discord.com/api/v9/channels/${channelId}/typing`, {
			method: 'POST',
			headers: {
				Authorization: (await API.getToken(AppState.userId() as string)) as string,
			},
		});
		setTimeout(async () => {
			console.log('d');
			setShouldSendTyping(true);
		}, 3000);
	}

	const [message, setMessage] = createSignal('');
	const [reference, setReference] = createSignal<null | any>(null);
	const [editing, setEditing] = createSignal<null | any>(null);

	return (
		<div>
			<Dev>
				<div>
					<input
						oninput={(e) => {
							setChannelId(e.currentTarget.value);
						}}
						value={channelId()}
						placeholder="ChannelId"
					/>
					<input
						oninput={(e) => {
							setGuildId(e.currentTarget.value);
						}}
						value={guildId()}
						placeholder="GuildId"
					/>
					<button
						onclick={() => {
							fetchMessages();
						}}
					>
						update Messages
					</button>
				</div>
			</Dev>

			<A href="/">back</A>
			<ol style={{ 'overflow-y': 'auto', height: '60rem' }}>
				<For each={messages()} fallback={<h1>loading</h1>}>
					{(val, index) => {
						let embed;

						if (val.embeds && val.embeds[0]) {
							switch (val.embeds[0].type) {
								case 'gifv':
									embed = (
										<video
											src={val.embeds[0].video.proxy_url}
											autoplay={true}
											loop={true}
											width={val.embeds[0].video.width}
											height={val.embeds[0].video.height}
										></video>
									);
									break;
								case 'video':
									embed = (
										<img
											src={val.embeds[0].thumbnail.proxy_url}
											width={val.embeds[0].thumbnail.width}
											height={val.embeds[0].thumbnail.height}
										></img>
									);
									break;
								default:
									embed = <h2>{JSON.stringify(val.embeds[0])}</h2>;
									break;
							}
						}
						return (
							<li>
								{intl.format(val.timestamp)} <br /> {val.author.username}: {val.content}
								{!!embed && embed}
								{val.author.id == AppState.userId() && (
									<button
										class={style.button}
										onClick={() => {
											if (editing()?.id == val.id) {
												setEditing(null);
												setMessage('');
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
											guild_id: guildId,
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
						const msg = message();
						setMessage('');
						if (editing()) {
							const res = await API.editMessage(channelId(), editing().id, msg);
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
							const res = await API.sendMessage(channelId(), msg, reference());
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
}
export default MessageTest;
