import { createSignal, onCleanup, onMount, Show } from 'solid-js';
import { invoke } from '@tauri-apps/api/tauri';
import Tests from './Tests';
import API from './API';

import qrcode from 'qrcode';
import { startListener, useTaurListener } from './test';
import { GuildsResponse, UsersResponse } from './discord';
import { Link, useBeforeLeave } from '@solidjs/router';
import HCaptcha from 'solid-hcaptcha';
import { emit } from '@tauri-apps/api/event';
import { useAppState } from './AppState';
import A from './Anchor';

import './prev.css';

function Prev() {
	const [showMsg, setshowMsg] = createSignal('');
	const [name, setName] = createSignal('');
	const [password, setPassword] = createSignal('');

	const [code, setCode] = createSignal('');

	const [requireCode, setRequireCode] = createSignal(false);
	const [didSendSMS, setDidSendSMS] = createSignal(false);
	const [captcha_key, setCaptchaKey] = createSignal('');

	const [image, setImage] = createSignal('');

	const [guilds, setGuilds] = createSignal<
		Array<{ guild_id: string; affinity: number }>
	>([]);
	const AppState = useAppState();

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

		if (res.mfa || res.sms) {
			setRequireCode(true);
		}

		if (res.type == 'loginSuccess') {
			setUserId(res.user_id);
		}
		setshowMsg(JSON.stringify(res));
	}
	async function logout() {
		let token = await API.getToken(userId());
		if (!token) {
			setshowMsg('No token');
			return;
		}
		// let res = await invoke('logout', {
		// 	token: token,
		// });
		//https://discord.com/api/v9/auth/logout
	}

	const a = startListener('mobileAuth', (event) => {
		/* console.log('js: rs2js: ', event); */

		interface i {
			type: string;
		}
		interface qrcode extends i {
			type: 'qrcode';
			qrcode: string;
		}
		interface ticketData extends i {
			type: 'ticketData';
			userId: string;
			discriminator: string;
			username: string;
			avatarHash: string;
		}

		let input = event.payload as unknown as
			| qrcode
			| ticketData
			| { type: 'loginSuccess' };
		console.log(input);
		switch (input.type) {
			case 'qrcode':
				console.log(input.qrcode);
				qrcode.toDataURL(input.qrcode, (err: any, url: any) => {
					setImage(url);
				});
				break;

			case 'ticketData':
				setUserId(input.userId);
				setshowMsg(
					`userId: ${input.userId}, discriminator: ${input.discriminator}, username: ${input.username}, avatarHash: ${input.avatarHash}`
				);
				setImage(
					`https://cdn.discordapp.com/avatars/${input.userId}/${input.avatarHash}.webp?size=128`
				);
				break;
			case 'loginSuccess':
				setshowMsg('login success');
				break;
		}
	});
	useBeforeLeave(async () => {
		console.log('cleanup');
		(await a)();
		console.log('cleanup done');
	});
	onMount(async () => {
		//await invoke("set_state", { state: "test" });
		//let r: string = await invoke('get_qrcode', {});
		await emit('requestQrcode', {});
		// console.log(r);

		// if (r) {
		// 	qrcode.toDataURL(r, (err: any, url: any) => {
		// 		setImage(url);
		// 	});
		// }

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
					<Show when={requireCode()}>
						<form
							onSubmit={async (e) => {
								e.preventDefault();
								let res: any = await invoke('verify_login', {
									code: code(),
									isSms: didSendSMS(),
								});
								AppState.setUserToken(res.token);
								let resData = await API.getCurrentUser();
								AppState.setUserID(resData.id);
								console.log(AppState.userID());
							}}
						>
							<input
								type="text"
								name="code"
								placeholder="Code"
								onChange={(e) => {
									setCode(e.currentTarget.value);
								}}
							/>
							<button
								type="button"
								onclick={() => {
									setDidSendSMS(true);
								}}
							>
								Send SMS
							</button>
							<button type="submit">submit</button>
						</form>
					</Show>
					<img src={image()} alt="fuck off" />
				</div>
			</div>
			<div>
				<button
					onClick={async () => {
						await invoke('set_state', { state: 'main' });
					}}
				>
					change state to main
				</button>
				<button
					onClick={async (e) => {
						console.log('start gateway');
						await emit('startGateway', { user_id: userId() });
					}}
				>
					Start Gateway
				</button>
			</div>
			<p>{showMsg}</p>
			{guilds().map((guild) => {
				return (
					<p>
						{guild.guild_id} {guild.affinity}
					</p>
				);
			})}

			<A href="/gamitofurras" state="LoginScreen">
				Gami to Furras
			</A>
			<Link href="/gamitofurras">Gami to Furras2</Link>
		</div>
	);
}

export default Prev;
