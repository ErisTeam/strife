// SolidJS
import { createResource, createSignal, Match, onCleanup, onMount, Show } from 'solid-js';
import { A, Link, useBeforeLeave } from '@solidjs/router';
import HCaptcha from 'solid-hcaptcha';

// Tauri
import { invoke } from '@tauri-apps/api/tauri';
import { emit } from '@tauri-apps/api/event';

// API
import API from './API';
import { changeState, useTaurListener, useTaurListenerOld } from './test';
import { useAppState } from './AppState';
import qrcode from 'qrcode';

// Style
import style from './prev.module.css';
import buttons from './Styles/Buttons.module.css';
import inputs from './Styles/Inputs.module.css';
import { info } from 'tauri-plugin-log-api';
import SplashText from './Components/Dev/SplashText';

// TODO: Clean up this mess, also, Gami to Furras
function Prev() {
	const [a] = createResource(async () => {
		throw new Error('test');
	});

	console.log('Prev');
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
	}
	async function logout() {
		const token = await API.getToken();
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

		const input = event.payload as
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
				setCaptchaKey(input.captcha_sitekey);
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

	return (
		<div class={style.container}>
			<h1>{AppState.userId()}</h1>
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
				<SplashText text="REQUIRED">
					<button
						class={buttons.default}
						onClick={async (e) => {
							console.log(`activating user ${AppState.userId()}`);
							const r = await invoke('activate_user', { userId: AppState.userId() });
							console.log(r);
						}}
					>
						Activate User
					</button>
				</SplashText>
				<button
					class={buttons.default}
					onclick={() => {
						setImage('aa');
					}}
				>
					Error Test
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
						await emit('testReconnecting', { user_id: AppState.userId() });
					}}
				>
					Test Reconnecting (Broken)
				</button>
				<div>
					<button
						class={buttons.default}
						onclick={async (e) => {
							console.log(AppState.userId());
							console.log(await API.getUserData(AppState.userId() as string));
						}}
					>
						Get User Data
					</button>
					<button
						class={buttons.default}
						onclick={async (e) => {
							console.log(await API.getRelationships(AppState.userId() as string));
						}}
					>
						Get Relationships
					</button>
					<button
						class={buttons.default}
						onclick={async (e) => {
							console.log(API.updateGuilds());
						}}
					>
						Update Guilds
					</button>
				</div>
			</div>
			<p>{showMsg()}</p>
			<Show when={image() == 'aa'}>
				{(() => {
					return <div>{a()}</div>;
				})()}
			</Show>
			<div style="background-color:var(--depth2);width:fit-content;height:fit-content;display:flex;justify-content:center;flex-direction:column;align-items:center;gap:0.5rem;padding:1rem;">
				<A class={buttons.default} href="/login">
					Better Login
				</A>
				<A class={buttons.default} href="/app">
					Application
				</A>
				<A class={buttons.default} href="/messagetest">
					message test
				</A>
				<A class={buttons.default} href="/dev/loadingtest">
					Loading Test
				</A>
				<SplashText text="Check It Out" settings={{ noWrap: true }}>
					<A class={buttons.default} href="/dev/test">
						Context Menu Test
					</A>
				</SplashText>
				<A class={buttons.default} href="/dev/translationtest">
					Translation Test
				</A>
				<A class={buttons.default} href="/dev/guildtest">
					Guild Test
				</A>
				<A class={buttons.default} href="/shugsgsrolfdghdflgddid">
					Error Page
				</A>
			</div>
		</div>
	);
}

export default Prev;
