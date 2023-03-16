// SolidJS
import { createSignal, Match, onMount, Show } from 'solid-js';
import { A, Link, useBeforeLeave } from '@solidjs/router';
import HCaptcha from 'solid-hcaptcha';

// Tauri
import { invoke } from '@tauri-apps/api/tauri';
import { emit } from '@tauri-apps/api/event';

// API
import API from './API';
import { changeState, useTaurListener } from './test';
import { useAppState } from './AppState';
import qrcode from 'qrcode';

// Components
import Anchor from './Components/Anchor/Anchor';

// Style
import style from './prev.module.css';
import buttons from './Styles/Buttons.module.css';
import inputs from './Styles/Inputs.module.css';

// TODO: Clean up this mess, also, Gami to Furras
function Prev() {
	//window.location.replace('http://192.168.1.121:1420');

	const [showMsg, setshowMsg] = createSignal('');
	const [name, setName] = createSignal('');
	const [password, setPassword] = createSignal('');

	const [code, setCode] = createSignal('');

	const [requireCode, setRequireCode] = createSignal(false);
	const [didSendSMS, setDidSendSMS] = createSignal(false);
	const [captcha_key, setCaptchaKey] = createSignal('');

	const [mobileAuthCaptcha, setMobileAuthCaptcha] = createSignal(false);

	const [image, setImage] = createSignal('');

	const AppState = useAppState();

	async function login(captcha_token: string | null = null) {
		console.log(`test`, captcha_token);

		await emit('login', {
			captchaToken: captcha_token,
			login: name(),
			password: password(),
		});
		return;
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
		let token = await API.getToken();
		if (!token) {
			setshowMsg('No token');
			return;
		}
		// let res = await invoke('logout', {
		// 	token: token,
		// });
		//https://discord.com/api/v9/auth/logout
	}

	useTaurListener('auth', (event) => {
		interface i {
			type: string;
		}
		interface qrcode extends i {
			type: 'mobileQrcode';
			qrcode: string;
		}
		interface ticketData extends i {
			type: 'ticketData';
			userId: string;
			discriminator: string;
			username: string;
			avatarHash: string;
		}
		interface RequireAuth extends i {
			type: 'requireAuth';
			captcha_key?: string[];
			captcha_sitekey?: string;
			mfa: boolean;
			sms: boolean;
		}
		interface RequireAuthMobile extends i {
			type: 'requireAuthMobile';
			captcha_key?: string[];
			captcha_sitekey: string;
		}
		interface VerifyError extends i {
			type: 'VerifyError';
			message: string;
		}
		interface Error extends i {
			type: 'error';
			message: string;
			code: number;
			errors: any;
		}

		let input = event.payload as unknown as
			| qrcode
			| ticketData
			| RequireAuth
			| RequireAuthMobile
			| VerifyError
			| Error
			| { type: 'loginSuccess'; userId: string; userSettings?: any };
		console.log(input, event);
		switch (input.type) {
			case 'mobileQrcode':
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
				setImage(`https://cdn.discordapp.com/avatars/${input.userId}/${input.avatarHash}.webp?size=128`);
				break;
			case 'loginSuccess':
				setshowMsg('login success');
				break;
			case 'requireAuth':
				console.log(input);
				if (input.captcha_key?.includes('captcha-required')) {
					setCaptchaKey(input.captcha_sitekey as string);
					setMobileAuthCaptcha(false);
					console.log('captcha required');
				}
				if (input.mfa || input.sms) {
					setRequireCode(true);

					if (input.sms) {
						emit('send_sms', {});
					}
				}
				break;
			case 'requireAuthMobile':
				setCaptchaKey(input.captcha_sitekey as string);
				setMobileAuthCaptcha(true);
				break;
			case 'VerifyError':
				setshowMsg(input.message);
				break;
			case 'error':
				setshowMsg(JSON.stringify(input));
				break;

			//case "loginSuccess":
			//AppState.setUserID(id);
			//	break
		}
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
	useBeforeLeave(async () => {
		console.log('cleanup');

		clearInterval(r);
		console.log('cleanup done');
	});

	onMount(async () => {
		await emit('requestQrcode', {});
		await emit('startMobileGateway', {});
	});

	return (
		<div class={style.container}>
			<h1>{AppState.userID()}</h1>
			<div class={style.row}>
				<div>
					<input class={inputs.default} onChange={(e) => setName(e.currentTarget.value)} placeholder="Login" />
					<input
						class={inputs.default}
						type="password"
						placeholder="password"
						onChange={(e) => setPassword(e.currentTarget.value)}
					/>
					<button type="button" onClick={() => login()} class={buttons.default}>
						Login
					</button>

					<Show when={captcha_key()}>
						<HCaptcha
							sitekey={captcha_key()}
							onVerify={(token) => {
								console.log(mobileAuthCaptcha(), 'aaaaaaaaaa');
								if (!mobileAuthCaptcha()) {
									login(token);
								} else {
									console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
									emit('loginMobileAuth', {
										captcha_token: token,
									});
								}
							}}
						/>
					</Show>
					<Show when={requireCode()}>
						<form
							onSubmit={async (e) => {
								e.preventDefault();
								await emit('verify_login', {
									code: code(),
								});

								console.log(await API.getToken());
								// let res: any = await invoke('verify_login', {
								// 	code: code(),
								// 	isSms: didSendSMS(),
								// });
								// AppState.setUserID(res.UserId);
								//localStorage.setItem('userToken', res.token);
							}}
						>
							<input
								class={inputs.defautl}
								type="text"
								name="code"
								placeholder="Code"
								onChange={(e) => {
									setCode(e.currentTarget.value);
								}}
							/>
							<button
								class={buttons.default}
								type="button"
								onclick={() => {
									setDidSendSMS(true);
								}}
							>
								Send SMS
							</button>
							<button
								type="submit"
								class={buttons.default}
								onClick={() => {
									emit('verifyLogin', { code: code() });
								}}
							>
								submit
							</button>
						</form>
					</Show>
					<img src={image()} alt="QR Code" />
				</div>
			</div>
			<div>
				<button
					class={buttons.default}
					onClick={async () => {
						changeState('Application');
					}}
				>
					change state to main
				</button>
				<button
					class={buttons.default}
					onClick={async (e) => {
						console.log('start gateway');
						await emit('startGateway', { user_id: AppState.userID() });
					}}
				>
					Start Gateway
				</button>
				<button
					class={buttons.default}
					onClick={async (e) => {
						await invoke('test', {});
					}}
				>
					Notification Test
				</button>
				<button
					class={buttons.default}
					onClick={async (e) => {
						await emit('testReconnecting', { user_id: AppState.userID() });
					}}
				>
					Test Reconnecting
				</button>
				<button
					onclick={async (e) => {
						console.log(AppState.userID());
						console.log(
							await invoke('get_user_data', {
								id: AppState.userID(),
							})
						);
					}}
				>
					Get User Data
				</button>
			</div>
			<p>{showMsg}</p>
			<div style="background-color:var(--depth2);width:fit-content;height:fit-content;display:flex;justify-content:center;flex-direction:column;align-items:center;gap:0.5rem;padding:1rem;">
				<Anchor class={[buttons.default].join(' ')} href="/login" state="LoginScreen">
					Better Login
				</Anchor>
				<Anchor class={[buttons.default].join(' ')} href="/main" state="Application">
					Main
				</Anchor>
				<Anchor class={[buttons.default].join(' ')} href="/app" state="Application">
					Application
				</Anchor>
				<Anchor class={[buttons.default].join(' ')} href="/messagetest" state="Application">
					message test
				</Anchor>
				<Anchor class={[buttons.default].join(' ')} href="/loading" state="Application">
					Loading Test
				</Anchor>
				<A class={[buttons.default].join(' ')} href="/shugsgsrolfdghdflgddid">
					Error Page
				</A>
			</div>
		</div>
	);
}

export default Prev;
