import { A } from '@solidjs/router';
import { createEffect, createSignal, For, Index, onCleanup } from 'solid-js';
import API from './API';
import { startListener } from './test';
interface i {
	type: string;
}
interface messageCreate extends i {
	type: 'MessageCreate';
	message: {
		content: string;
		author: {
			username: string;
		};
	};
}
function MessageTest() {
	const [messages, setMessages] = createSignal<any[]>([]);
	createEffect(async () => {
		const l = startListener<messageCreate>('gateway', (msg) => {
			switch (msg.payload.type) {
				case 'MessageCreate':
					let m = messages();
					console.log(msg, m);
					m.push({
						content: msg.payload.message.content,
						author: msg.payload.message.author.username,
					});
					setMessages(m);
					break;

				default:
					console.log('default');
					break;
			}

			setMessages((a) => [
				{
					content: msg.payload.message.content,
					author: msg.payload.message.author.username,
				},
				...messages(),
			]);
			console.log(msg.payload);
		});
		onCleanup(async () => {
			console.log('cleanup');
			(await l)();
		});
	});

	const [message, setMessage] = createSignal('');

	return (
		<div>
			<A href="/">back</A>
			<ol>
				<For each={messages()} fallback={<h1>loading</h1>}>
					{(val, content) => (
						<li>
							{val.author}: {val.content}
						</li>
					)}
				</For>
			</ol>
			<div>
				<input
					type="text"
					onChange={(e) => {
						setMessage(e.currentTarget.value);
					}}
					value={message()}
				/>
				<button
					onClick={async () => {
						let msg = message();
						setMessage('');
						let res = await API.sendMessage('419544210027446276', msg);
					}}
				>
					send
				</button>
			</div>
		</div>
	);
}
export default MessageTest;
