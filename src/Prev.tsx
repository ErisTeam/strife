import { createSignal, onCleanup, onMount, Show } from 'solid-js';
import { invoke } from '@tauri-apps/api/tauri';
import Tests from './Tests';

import qrcode from 'qrcode';
import { getToken, startListener, useTaurListener } from './test';
import { GuildsResponse, UsersResponse } from './discord';
import { A, Link } from '@solidjs/router';
import HCaptcha from 'solid-hcaptcha';
import { emit } from '@tauri-apps/api/event';

function Prev() {
	const [greetMsg, setGreetMsg] = createSignal('');
	const [name, setName] = createSignal('');
	const [password, setPassword] = createSignal('');

	const [captcha_token, setCaptchaToken] = createSignal('');

	const [captcha_key, setCaptchaKey] = createSignal('');

	const [image, setImage] = createSignal('');

	const [guilds, setGuilds] = createSignal<
		Array<{ guild_id: string; affinity: number }>
	>([]);

	const [userId, setUserId] = createSignal('');

	async function login() {
		console.log(`test`);
		let res: any = await invoke('login', {
			captcha_token: captcha_token(),
			login: name(),
			password: password(),
		});
		let json = JSON.parse(res);
		console.log(json);
		if (json.captcha_key.includes('captcha-required')) {
			setCaptchaKey(json.captcha_sitekey);
		}
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
	const a = startListener((event) => {
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
	onCleanup(async () => {
		console.log('cleanup');
		(await a)();
		console.log('cleanup done');
	});
	onMount(async () => {
		let r: string = await invoke('get_qrcode', {});
		console.log(r);

		if (r) {
			qrcode.toDataURL(r, (err: any, url: any) => {
				setImage(url);
			});
		}

		//let qrcode = await invoke("getQrcode");
		//console.log(qrcode);
	});

	return (
		<div class="container">
			<div class="row">
				<div>
					<input
						onChange={(e) => setName(e.currentTarget.value)}
						placeholder="Login"
					/>
					<input
						type="password"
						placeholder="password"
						onChange={(e) => setPassword(e.currentTarget.value)}
					/>
					<button type="button" onClick={() => login()}>
						Login
					</button>
					<Show when={captcha_key()}>
						<HCaptcha
							sitekey={captcha_key()}
							onVerify={(token) => setCaptchaToken(token)}
						/>
					</Show>
					<img src={image()} />
				</div>
				<button
					onClick={async (e) => {
						await emit('g', { test: 'test' });
					}}
				>
					test
				</button>
			</div>

			<p>{greetMsg}</p>
			{guilds().map((guild) => {
				return (
					<p>
						{guild.guild_id} {guild.affinity}
					</p>
				);
			})}

			<A href="/login">test</A>

			<Tests />
		</div>
	);
}

export default Prev;
