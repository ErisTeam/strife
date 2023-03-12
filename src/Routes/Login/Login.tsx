// SolidJS
import { createSignal, onMount } from 'solid-js';
import { useBeforeLeave } from '@solidjs/router';

// Tauri
import { emit } from '@tauri-apps/api/event';

// API
import API from './../../API';
import { useTaurListener } from './../../test';
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
	function showCaptha() {
		if (!MFAClass().includes(style.toRight) && !MFAClass().includes(style.toLeft)) {
			setMFAClass([style.container, style.toLeft].join(' '));
		}
		if (!loginClass().includes(style.toLeft) && !loginClass().includes(style.toRight)) {
			setLoginClass([style.container, style.Left].join(' '));
		}
		setCaptchaClass([style.container].join(' '));
	}
	function showMFA() {
		if (!captchaClass().includes(style.toRight) && !captchaClass().includes(style.toLeft)) {
			setCaptchaClass([style.container, style.toLeft].join(' '));
		}
		if (!loginClass().includes(style.toLeft) && !loginClass().includes(style.toRight)) {
			setLoginClass([style.container, style.toLeft].join(' '));
		}
		setMFAClass([style.container].join(' '));
	}
	const [loginClass, setLoginClass] = createSignal([style.container].join(' '));
	const [MFAClass, setMFAClass] = createSignal([style.container, style.toRight].join(' '));
	const [captchaClass, setCaptchaClass] = createSignal([style.container, style.toRight].join(' '));

	async function logout() {
		let token = await API.getToken(AppState.userID());
		if (!token) {
			console.log('No token');
		}
	}

	useTaurListener('auth', (event) => {
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

		interface requireAuth extends i {
			type: 'requireAuth';
			captcha_key?: string[];
			captcha_sitekey?: string;
			mfa: boolean;
			sms: boolean;
		}

		let input = event.payload as unknown as qrcode | ticketData | requireAuth | { type: 'loginSuccess' };

		switch (input.type) {
			case 'qrcode': {
				qrcode.toDataURL(input.qrcode, (err: any, url: any) => {
					setImage(url);
				});

				setUserData(undefined);

				break;
			}

			case 'ticketData': {
				AppState.setUserID(input.userId);

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
				console.log('login success');
				break;
			}

			case 'requireAuth': {
				if (input.captcha_key?.includes('captcha-required')) {
					setCaptchaKey(input.captcha_sitekey as string);
					showCaptha();
					console.log('captcha required');
				}
				if (input.mfa || input.sms) {
					console.log('mfa required');

					setRequireCode(true);
					showMFA();

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

	return (
		<div class={style.wrapper}>
			<div class={style.gradient}>
				<img src="LoginPage/BackgroundDoodle.png" alt="Decorative Background"></img>
			</div>
			{/* Main Page */}
			<div class={loginClass()}>
				<LoginBox class={style.loginBox} login={login} />

				<QRCode
					class={style.qrcode}
					qrcode_src={image()}
					header="Log In With QR Code"
					paragraph="Scan the code with our app or any other one to log in!"
					altParagraph="If you didn't mean to log in then just ignore the prompt on your discord app."
					user_data={userData()}
				></QRCode>
			</div>
			<div class={MFAClass()}>
				<MFABox />
			</div>
			<div class={captchaClass()}>
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
