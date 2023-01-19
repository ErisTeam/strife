/** @format */

import { createSignal, onMount } from 'solid-js';
import logo from './assets/logo.svg';
import { invoke } from '@tauri-apps/api/tauri';
import { emit, listen } from '@tauri-apps/api/event';
import './App.css';
import Tests from './Tests';

import qrcode from 'qrcode';
import { startListener } from './test';

function App() {
	const [greetMsg, setGreetMsg] = createSignal('');
	const [name, setName] = createSignal('');

	const [login, setLogin] = createSignal('');
	const [password, setPassword] = createSignal('');

	const [image, setImage] = createSignal('');

	// For testing, delete later
	const [testValue, setTestValue] = createSignal('');

	async function greet() {
		// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
		setGreetMsg(await invoke('greet', { name: name() }));
	}
	async function test() {
		setGreetMsg(await invoke('test', { login: login(), password: password() }));
	}

	onMount(async () => {
		//let qrcode = await invoke("getQrcode");
		//console.log(qrcode);
		startListener((event) => {
			console.log('js: rs2js: ' + event);
			let input = JSON.parse(event.payload) as { type: string };
			console.log(input);
			if (input.type == 'qrcode') {
				let i = input as { type: string; qrcode: string };

				qrcode.toDataURL(i.qrcode, (err: any, url: any) => {
					setImage(url);
				});
			} else if (input.type == 'ticketData') {
				let i = input as { type: string; userId: string; discriminator: string; username: string; avatarHash: string };
				setGreetMsg(`userId: ${i.userId}, discriminator: ${i.discriminator}, username: ${i.username}, avatarHash: ${i.avatarHash}`);
				setImage(`https://cdn.discordapp.com/avatars/${i.userId}/${i.avatarHash}.webp?size=128`);
			}
		});
	});

	return (
		<div class='container'>
			<div class='row'>
				<div>
					<input id='greet-input' onChange={(e) => setName(e.currentTarget.value)} placeholder='Enter a name...' />
					<button type='button' onClick={() => greet()}>
						Greet
					</button>
				</div>
			</div>

			<p>{greetMsg}</p>

			<Tests />
		</div>
	);
}

export default App;
