// SolidJS
import { createSignal, onMount, Show } from 'solid-js';
import { Link, useBeforeLeave } from '@solidjs/router';
import HCaptcha from 'solid-hcaptcha';

// Tauri
import { invoke } from '@tauri-apps/api/tauri';
import { emit } from '@tauri-apps/api/event';

// API
import API from './API';
import { changeState, startListener } from './test';
import { useAppState } from './AppState';
import qrcode from 'qrcode';

// Components
import Anchor from './Anchor';

// Style
import './prev.css';

// TODO: Clean up this mess, also, Gami to Furras
function Prev() {
	const [showMsg, setshowMsg] = createSignal('');
	const [name, setName] = createSignal('');
	const [password, setPassword] = createSignal('');

	const [code, setCode] = createSignal('');

	const [requireCode, setRequireCode] = createSignal(false);
	const [didSendSMS, setDidSendSMS] = createSignal(false);
	const [captcha_key, setCaptchaKey] = createSignal('');

	const [image, setImage] = createSignal('');

	const AppState = useAppState();

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
		if (res.type == 'RequireAuth') {
			if (res.mfa || res.sms) {
				setRequireCode(true);

				if (res.sms) {
					await invoke('send_sm', {});
				}
			}
		}

		if (res.type == 'loginSuccess') {
			AppState.setUserID(res.user_id);
		}
		setshowMsg(JSON.stringify(res));
	}
	async function logout() {
		let token = await API.getToken(AppState.userID());
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
		console.log(input, event);
		switch (input.type) {
			case 'qrcode':
				console.log(input.qrcode);
				qrcode.toDataURL(input.qrcode, (err: any, url: any) => {
					setImage(url);
				});
				break;

			case 'ticketData':
				AppState.setUserID(input.userId);
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
		//await invoke('set_state', { state: 'test' });
		//let r: string = await invoke('get_qrcode', {});

		await emit('requestQrcode', {});
	});

	let r = setInterval(async () => {
		if (image()) {
			console.log('clearing interval', image());
			clearInterval(r);
		} else {
			await emit('requestQrcode', {});
			console.log('requesting qrcode');
		}
	}, 5000);

	return (
		<div class="container">
			<h1>{AppState.userID()}</h1>
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
								AppState.setUserID(res.UserId);
								//localStorage.setItem('userToken', res.token);
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
					<img src={image()} alt="QR Code" />
				</div>
			</div>
			<div>
				<button
					onClick={async () => {
						changeState('Application');
					}}
				>
					change state to main
				</button>
				<button
					onClick={async (e) => {
						console.log('start gateway');
						await emit('startGateway', { user_id: AppState.userID() });
					}}
				>
					Start Gateway
				</button>
			</div>
			<p>{showMsg}</p>

			<Anchor href="/gamitofurras" state="LoginScreen">
				Gami to Furras
			</Anchor>
			<Anchor href="/app" state="Application">
				Application
			</Anchor>
			<Link href="/gamitofurras">Gami to Furras2</Link>
		</div>
	);
}

export default Prev;
