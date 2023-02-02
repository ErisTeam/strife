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

	const [captcha_key, setCaptchaKey] = createSignal('');

	const [image, setImage] = createSignal('');

	const [guilds, setGuilds] = createSignal<
		Array<{ guild_id: string; affinity: number }>
	>([]);

	const [userId, setUserId] = createSignal('');

	async function login(captcha_token: string | null = null) {
		console.log(`test`, captcha_token);
		let res: any = await invoke('login', {
			captchaToken: captcha_token,
			login: name(),
			password: password(),
		});

		console.log(res);
		if (res.captcha_key?.includes('captcha-required')) {
			setCaptchaKey(res.captcha_sitekey);
		}
		if (res.type == 'loginSuccess') {
			setUserId(res.user_id);
		}
		setGreetMsg(JSON.stringify(res));
	}
	async function logout() {
		let token = await getToken(userId());
		if (!token) {
			setGreetMsg('No token');
			return;
		}
		// let res = await invoke('logout', {
		// 	token: token,
		// });
		//https://discord.com/api/v9/auth/logout
	}

	async function getGuilds() {
		if (!userId()) {
			setGreetMsg('No user id');
			return;
		}
		let token = await getToken(userId());
		if (!token) {
			setGreetMsg('No token');
			return;
		}
		console.log(token);
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
	async function getUsers() {
		if (!userId()) {
			setGreetMsg('No user id');
			return;
		}
		let token = await getToken(userId());
		if (!token) {
			setGreetMsg('No token');
			return;
		}
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
			setGreetMsg('login success');
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

		// let b = await invoke('test', {});
		// console.log('b', b);
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
							onVerify={(token) => {
								login(token);
							}}
						/>
					</Show>
					<img src={image()} />
				</div>
			</div>
			<div class="row">
				<div>
					<button
						onClick={() => {
							getGuilds();
						}}
					>
						Get Guilds
					</button>
					<button
						onClick={() => {
							getUsers();
						}}
					>
						Get Users
					</button>
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

			<A href="/gamitofurras">Gami to Furras</A>

			<Tests />
		</div>
	);
}

export default Prev;
