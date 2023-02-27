import { A } from '@solidjs/router';
import {
	createEffect,
	createResource,
	createSignal,
	For,
	Index,
	onCleanup,
} from 'solid-js';
import API from './API';
import { useAppState } from './AppState';
import { startGatewayListener } from './test';
interface i {
	type: string;
}
interface messageCreate extends i {
	type: 'MessageCreate';
	user_id: string;
	data: {
		content: string;
		author: {
			username: string;
		};
		timestamp: string;
	};
}

const channelId = '419544210027446276';

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
	startGatewayListener<messageCreate>(AppState.userID(), (msg) => {
		console.log('gateway', msg, msg.payload, msg.payload.type);
		switch (msg.payload.type) {
			case 'MessageCreate':
				console.log('message create');
				setMessages((a) => [
					...a,
					{
						...msg.payload.data,
						timestamp: new Date(msg.payload.data.timestamp),
					},
				]);
				console.log('message create');
				console.log(messages());
				break;

			default:
				console.log('default');
				break;
		}

		console.log(msg.payload);
	});

	// createEffect(async () => {
	// 	const l = startListener<messageCreate>('gateway',
	// 	onCleanup(async () => {
	// 		console.log('cleanup');
	// 		(await l)();
	// 	});
	// });

	const [message, setMessage] = createSignal('');

	return (
		<div>
			<A href="/">back</A>
			<ol style={{ 'overflow-y': 'auto', height: '60rem' }}>
				<For each={messages()} fallback={<h1>loading</h1>}>
					{(val, index) => (
						<li>
							{intl.format(val.timestamp)} <br /> {val.author.username}:{' '}
							{val.content}
							{val.author.id == AppState.userID() && <button>edit</button>}
						</li>
					)}
				</For>
			</ol>
			<div>
				<input
					style={{ width: '60rem' }}
					type="text"
					onChange={(e) => {
						setMessage(e.currentTarget.value);
					}}
					placeholder="message"
					value={message()}
				/>
				<button
					onClick={async () => {
						let msg = message();
						setMessage('');
						let res = await API.sendMessage(channelId, msg);
						setMessages((a) => [
							...a,
							{
								...res,
								timestamp: new Date(res.timestamp),
							},
						]);
					}}
				>
					send
				</button>
			</div>
		</div>
	);
}
export default MessageTest;
