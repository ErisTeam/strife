// SolidJS
import { Show, createSignal, onCleanup, onMount } from 'solid-js';
import { useBeforeLeave, useNavigate } from '@solidjs/router';
import { useTrans } from '../../Translation';
// Tauri
import { emit } from '@tauri-apps/api/event';

// API
import API from './../../API';
import { useTaurListener, useTaurListenerOld } from './../../test';
import { useAppState } from './../../AppState';
import qrcode from 'qrcode';
import { UserData } from '../../Components/Login/QRCode';

// Components
import LoginBox from '../../Components/Login/LoginBox';
import QRCode from '../../Components/Login/QRCode';
import MFABox from '../../Components/Login/MFABox';
// Style
import style from './Login.module.css';
import Dev from '../../Components/Dev/Dev';
import { AuthEvents } from '../../types/Auth';
import HCaptcha from 'solid-hcaptcha';

//TODO clean

const LoginPage = () => {
	const [t] = useTrans();
	// Data of the user that scans the QR Code
	// If set to undefined the component will go back to showing the QR Code
	const [userData, setUserData] = createSignal<UserData>();

	// QR Code image. Switches to a profile picture of the user after succesful code scan.
	const [image, setImage] = createSignal('');

	const [requireCode, setRequireCode] = createSignal(false);
	const [didSendSMS, setDidSendSMS] = createSignal(false);
	const [captchaSiteKey, setCaptchaSiteKey] = createSignal('');

	const appState = useAppState();

	const [panel, setPanel] = createSignal<'login' | 'mfa' | 'captcha'>('login');

	const navigate = useNavigate();
	useTaurListener('auth', (event) => {
		const input = event.payload as AuthEvents;
		console.log('input', input);
		switch (input.type) {
			case 'mobileQrcode': {
				qrcode.toDataURL(input.qrcode, (err: any, url: any) => {
					setImage(url);
				});
				setUserData(undefined);
				break;
			}
			case 'mobileTicketData': {
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
				appState.setUserID(input.userId);

				console.log(appState.userId());

				console.log('login success');
				navigate('/');
				break;
			}
			case 'requireAuth': {
				if (input.captcha_key?.includes('captcha-required')) {
					setCaptchaSiteKey(input.captcha_sitekey);
					setPanel('captcha');
					console.log('captcha required');
				}
				if (input.mfa || input.sms) {
					console.log('mfa required');

					setRequireCode(true);
					setPanel('mfa');

					if (input.sms) {
						emit('send_sms', {});
					}
				}
				break;
			}
		}
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

	const [classes, setClasses] = createSignal<{ login: string; mfa: string; captcha: string }>({
		login: '',
		mfa: 'hidden',
		captcha: 'hidden',
	});

	function switchTo(to: 'login' | 'mfa' | 'captcha') {
		const current = panel();
		const direction = Math.random() > 0.5 ? 'left' : 'right';
		console.log(classes());
		setClasses((c) => {
			return {
				...c,
				[current]: direction == 'left' ? style.toLeft : style.toRight,
				[to]: direction == 'left' ? style.fromRight : style.fromLeft,
			};
		});
		console.log(classes());
		setPanel(to);
	}
	const [test, setTest] = createSignal(false);

	return (
		<div class={[style.wrapper, style.background].join(' ')}>
			<Dev>
				<button
					onclick={() => {
						switchTo('mfa');
					}}
				>
					show MFA
				</button>

				<button
					onclick={() => {
						switchTo('captcha');
					}}
				>
					show Captcha
				</button>
				<button
					onclick={() => {
						switchTo('login');
					}}
				>
					show Login
				</button>
				<button
					onclick={() => {
						setTest(!test());
					}}
				>
					Test
				</button>
			</Dev>

			<Show when={test()}>
				<div class={style.gradient}>
					<img src="LoginPage/BackgroundDoodle.png" alt="Decorative Background"></img>
				</div>
			</Show>

			{/* Main Page */}

			<div class={[style.container, classes().login].join(' ')}>
				<LoginBox class={style.loginBox} login={login} />

				<QRCode
					class={style.qrcode}
					qrcode_src={image()}
					fallback_src="/test.gif"
					header={t.LoginPage.qrCodeLogin()}
					paragraph={t.LoginPage.qrCodeParagraph()}
					altParagraph={t.LoginPage.qrCodeParagrpahAlt()}
					user_data={userData()}
				></QRCode>
			</div>

			<div class={[style.container, classes().mfa].join(' ')}>
				<MFABox verify={verifyLogin} />
			</div>
			<div class={[style.container, classes().captcha].join(' ')}>
				<div class={style.hcaptchaContainer}>
					<h1 class={style.header}>{t.LoginPage.captchaHeader()}</h1>
					<HCaptcha sitekey="" />
				</div>
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
