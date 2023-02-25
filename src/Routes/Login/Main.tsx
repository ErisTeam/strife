// SolidJS
import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import HCaptcha from 'solid-hcaptcha';

// Tauri
import { invoke } from '@tauri-apps/api';

// API
import { useLoginState } from './LoginState';

const Main = () => {
	const LoginState: any = useLoginState();
	const [showCaptcha, setShowCaptcha] = createSignal(false);
	const [email, setEmail] = createSignal('');
	const [password, setPassword] = createSignal('');
	const [captchaKey, setCaptchaKey] = createSignal('');
	const [captchaToken, setCaptchaToken] = createSignal('');
	const navigate = useNavigate();

	async function logIn() {
		const url = 'https://discord.com/api/v9/auth/login';
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({
				captcha_key: captchaToken(),
				gift_code_sku_id: null,
				login: email(),
				login_source: null,
				password: password(),
				undelete: false,
			}),
		});

		let resData = await response.json();

		if (typeof resData?.captcha_key !== 'undefined') {
			if (resData?.captcha_key[0] == 'captcha-required') {
				setShowCaptcha(true);
				setCaptchaKey(resData.captcha_sitekey);
			}
		}

		if (resData.token == null && resData.sms == true) {
			navigate('/login/mfa');
			LoginState.setTicket(resData.ticket);
			console.log(`Email: ${email()} captcha: ${captchaToken()}`);
			let res: any = JSON.parse(
				await invoke('logIn', {
					captcha_token: captchaToken(),
					login: email(),
					password: password(),
				})
			);
			console.log(res, res.captcha_sitekey);

			console.log(captchaKey());
		}
	}

	return (
		<div>
			<h1>Hemlo</h1>
			<form
				onSubmit={async (e) => {
					e.preventDefault();

					logIn();
				}}
			>
				<input
					onChange={(e) => {
						setEmail((e.target as HTMLInputElement).value);
					}}
				/>
				<input
					type="password"
					onChange={(e) => {
						setPassword((e.target as HTMLInputElement).value);
					}}
				/>
				<input type="submit" />
			</form>

			<Show when={showCaptcha()}>
				<HCaptcha
					sitekey={captchaKey()}
					onVerify={(token) => setCaptchaToken(token)}
				/>
			</Show>
		</div>
	);
};

export default Main;
