import { createSignal, onMount } from 'solid-js';
import logo from './assets/logo.svg';
import { invoke } from '@tauri-apps/api/tauri';
import { emit, listen } from '@tauri-apps/api/event';
import './Prev.css';
import Tests from './Tests';

import qrcode from 'qrcode';
import { getToken, startListener } from './test';
import { GuildsResponse, UsersResponse } from './discord';

function Prev() {
	const [greetMsg, setGreetMsg] = createSignal('');
	const [name, setName] = createSignal('');

	const [login, setLogin] = createSignal('');
	const [password, setPassword] = createSignal('');

	const [image, setImage] = createSignal('');

	const [guilds, setGuilds] = createSignal<
		Array<{ guild_id: string; affinity: number }>
	>([]);

	const [userId, setUserId] = createSignal('');

	async function test() {
		console.log('test');
		setGreetMsg(await invoke('get_qrcode', {}));
	}

	async function getGuilds() {
		let token = await getToken(userId());
		let json: GuildsResponse = await (
			await fetch('https://discord.com/api/v9/users/@me/affinities/guilds', {
				headers: new Headers({
					authorization: token as string,
				}),
				method: 'GET',
			})
		).json();
		console.log(json);
		setGuilds(json.guild_affinities);
	}
	async function get_users() {
		let token: string = await invoke('get_token', { id: userId() });
		let json: UsersResponse = await (
			await fetch('https://discord.com/api/v9/users/@me/affinities/users', {
				headers: new Headers({
					authorization: token,
				}),

				method: 'GET',
			})
		).json();
		console.log(json);
	}
	onMount(async () => {
		await invoke('get_qrcode', {});
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
				let i = input as {
					type: string;
					userId: string;
					discriminator: string;
					username: string;
					avatarHash: string;
				};
				setUserId(i.userId);
				setGreetMsg(
					`userId: ${i.userId}, discriminator: ${i.discriminator}, username: ${i.username}, avatarHash: ${i.avatarHash}`
				);
				setImage(
					`https://cdn.discordapp.com/avatars/${i.userId}/${i.avatarHash}.webp?size=128`
				);
			} else if (input.type == 'loginSuccess') {
				getGuilds();
			}
		});
	});

	return (
		<div class="container">
			<div class="row">
				<div>
					<input
						id="greet-input"
						onChange={(e) => setName(e.currentTarget.value)}
						placeholder="Enter a name..."
					/>
					<button type="button" onClick={() => test()}>
						Greet
					</button>
					<img src={image()} />
				</div>
			</div>

			<p>{greetMsg}</p>
			{guilds().map((guild) => {
				return (
					<p>
						{guild.guild_id} {guild.affinity}
					</p>
				);
			})}

			<Tests />
		</div>
	);
}

export default Prev;
