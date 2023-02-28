// SolidJS
import { createSignal, onMount } from 'solid-js';
import { useBeforeLeave } from '@solidjs/router';

// Tauri
import { emit } from '@tauri-apps/api/event';

// API
import API from './API';
import { changeState, useTaurListener } from './test';
import { useAppState } from './AppState';
import qrcode from 'qrcode';

// Components
import Anchor from './Anchor';
import Button from './Components/Button/Button';
import LoginBox from './Components/LoginBox/LoginBox';

// Style
import style from './LoginPage.module.css';
import QRCode from './Components/QRCode/QRCode';

// TODO: Clean up this mess, also, Gami to Furras
function Prev() {
	const [showMsg, setshowMsg] = createSignal('');
	const [name, setName] = createSignal('');
	const [password, setPassword] = createSignal('');

	const [requireCode, setRequireCode] = createSignal(false);
	const [didSendSMS, setDidSendSMS] = createSignal(false);
	const [captcha_key, setCaptchaKey] = createSignal('');

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
		let token = await API.getToken(AppState.userID());
		if (!token) {
			setshowMsg('No token');
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
		interface RequireAuth extends i {
			type: 'RequireAuth';
			captcha_key?: string[];
			captcha_sitekey?: string;
			mfa: boolean;
			sms: boolean;
		}

		let input = event.payload as unknown as
			| qrcode
			| ticketData
			| RequireAuth
			| { type: 'loginSuccess' };

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

			case 'RequireAuth':
				if (input.captcha_key?.includes('captcha-required')) {
					setCaptchaKey(input.captcha_sitekey as string);
				}
				if (input.mfa || input.sms) {
					setRequireCode(true);

					if (input.sms) {
						emit('send_sms', {});
					}
				}
				break;
		}
	});

	let r = setInterval(async () => {
		if (image()) {
			clearInterval(r);
		} else {
			await emit('requestQrcode', {});
		}
	}, 5000);

	useBeforeLeave(async () => {
		clearInterval(r);
	});

	onMount(async () => {
		await emit('requestQrcode', {});
	});

	return (
		<>
			<div class={style.container}>
				<div class={style.gradient}>
					<img
						style="object-fit:cover;width:100%;height:100%;z-index:6;position:absolute;"
						src="LoginPageSVGS/BackgroundDoodle.png"
					></img>
				</div>

				{/* <h1>{AppState.userID()}</h1> */}
				<div class={style.login}>
					<LoginBox class={style.loginBox} />
					{/* <Button type="button" onClick={() => login()}>
						Login
					</Button> */}
				</div>
				<QRCode
					class={style.qrcode}
					qrcode_src={image()}
					header="Log In With QR Code"
					paragraph="Scan the code with our app or any other one to log in!"
				></QRCode>
			</div>
			{/* Corner SVGS */}
			<div class={style.leftBottom}>
				<img class={style.leftBottom1} src="LoginPageSVGS/LeftBottom1.svg" />
				<img class={style.leftBottom2} src="LoginPageSVGS/LeftBottom2.svg" />
				<img class={style.leftBottom3} src="LoginPageSVGS/LeftBottom3.svg" />
			</div>
			<div class={style.leftTop}>
				<img class={style.leftTop1} src="LoginPageSVGS/LeftTop1.svg" />
				<img class={style.leftTop2} src="LoginPageSVGS/LeftTop2.svg" />
			</div>
			<div class={style.rightTop}>
				<img class={style.rightTop1} src="LoginPageSVGS/RightTop1.svg" />
				<img class={style.rightTop2} src="LoginPageSVGS/RightTop2.svg" />
			</div>
		</>
	);
}

export default Prev;
