// SolidJS
import { createSignal, onMount } from 'solid-js';
import { useBeforeLeave, useNavigate } from '@solidjs/router';

// Tauri
import { emit } from '@tauri-apps/api/event';

// API
import API from './../../API';
import { useTaurListenerOld } from './../../test';
import { useAppState } from './../../AppState';
import qrcode from 'qrcode';
import { UserData } from './../../Components/QRCode/QRCode';

// Components
import LoginBox from './../../Components/LoginBox/LoginBox';
import QRCode from './../../Components/QRCode/QRCode';
import MFABox from '../../Components/MFABox/MFABox';
// Style
import style from './Login.module.css';

const LoginPage = () => {
	// Data of the user that scans the QR Code
	// If set to undefined the component will go back to showing the QR Code
	const [userData, setUserData] = createSignal<UserData>();

	// QR Code image. Switches to a profile picture of the user after succesful code scan.
	const [image, setImage] = createSignal('');

	const [requireCode, setRequireCode] = createSignal(false);
	const [didSendSMS, setDidSendSMS] = createSignal(false);
	const [captcha_key, setCaptchaKey] = createSignal('');

	const AppState = useAppState();


	const [showMFA, setShowMFA] = createSignal(false);
	const [showCaptcha, setShowCaptcha] = createSignal(false);



	async function logout() {
		let token = await API.getToken();
		if (!token) {
			console.log('No token');
		}
	}
	const navigate = useNavigate();
	useTaurListenerOld('auth', (event) => {
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

		console.log('input', input);

		switch (input.type) {
			case 'mobileQrcode': {
				qrcode.toDataURL(input.qrcode, (err: any, url: any) => {
					setImage(url);
				});

				setUserData(undefined);

				break;
			}

			case 'ticketData': {
				setImage(`https://cdn.discordapp.com/avatars/${input.userId}/${input.avatarHash}.webp?size=128`);

				setUserData({
					user_id: input.userId,
					discriminator: input.discriminator,
					username: input.username,
					avatar_hash: input.avatarHash,
				});

				break;
			}

			case 'loginSuccess': {
				async () => {
					await API.updateCurrentUserID();
					console.log(AppState.userID());
				};
				console.log('login success');
				navigate('/');
				break;
			}

			case 'requireAuth': {
				if (input.captcha_key?.includes('captcha-required')) {
					setCaptchaKey(input.captcha_sitekey as string);
					// showCaptha();
					setShowCaptcha(true);
					console.log('captcha required');
				}
				if (input.mfa || input.sms) {
					console.log('mfa required');

					setRequireCode(true);
					setShowMFA(true);

					if (input.sms) {
						emit('send_sms', {});
					}
				}
				break;
			}
		}
	});

	let requestQrcode = setInterval(async () => {
		if (image()) {
			clearInterval(requestQrcode);
		} else {
			await emit('requestQrcode', {});
		}
	}, 5000);

	onMount(async () => {
		await emit('requestQrcode', {});
	});

	useBeforeLeave(async () => {
		clearInterval(requestQrcode);
	});

	async function login(name: string, password: string, captcha_token: string | null = null) {
		await emit('login', {
			captchaToken: captcha_token,
			login: name,
			password: password,
		});
	}
	async function verifyLogin(code: string) {
		console.log('Code: ' + code);
		console.log(
			await emit('verifyLogin', {
				code: code,
			})
		);
		API.updateCurrentUserID();
	}



	return (
		<div class={style.wrapper}>
			<div class={style.gradient}>
				<img src="LoginPage/BackgroundDoodle.png" alt="Decorative Background"></img>
			</div>

			{/* Main Page */}

			<div class={[style.container, showMFA() || showCaptcha() ? style.toLeft : style.fromLeft].join(' ')}>
				<LoginBox class={style.loginBox} login={login} />

				<QRCode
					class={style.qrcode}
					qrcode_src={image()}
					fallback_src="/test.gif"
					header="Log In With QR Code"
					paragraph="Scan the code with our app or any other one to log in!"
					altParagraph="If you didn't mean to log in then just ignore the prompt on your discord app."
					user_data={userData()}
				></QRCode>
			</div>

			<div
				class={style.container}
				classList={{
					[style.toRight]: !showMFA(),
					[style.fromRight]: showMFA(),
				}}
			>
				<MFABox verify={verifyLogin} />
			</div>
			<div
				class={style.container}
				classList={{
					[style.toRight]: !showCaptcha(),
					[style.fromRight]: showCaptcha(),
				}}
			>
				<h1>Captcha</h1>
			</div>

			{/* Corner SVGS */}
			<div class={style.leftBottom}>
				<img class={style.leftBottom1} alt="Decorative SVG" src="LoginPage/LeftBottom1.svg" />
				<img class={style.leftBottom2} alt="Decorative SVG" src="LoginPage/LeftBottom2.svg" />
				<img class={style.leftBottom3} alt="Decorative SVG" src="LoginPage/LeftBottom3.svg" />
			</div>
			<div class={style.leftTop}>
				<img class={style.leftTop1} alt="Decorative SVG" src="LoginPage/LeftTop1.svg" />
				<img class={style.leftTop2} alt="Decorative SVG" src="LoginPage/LeftTop2.svg" />
			</div>
			<div class={style.rightTop}>
				<img class={style.rightTop1} alt="Decorative SVG" src="LoginPage/RightTop1.svg" />
				<img class={style.rightTop2} alt="Decorative SVG" src="LoginPage/RightTop2.svg" />
			</div>
		</div>
	);
};
export default LoginPage;
