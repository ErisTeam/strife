import { Component, createSignal, Show } from 'solid-js';
import HCaptcha from 'solid-hcaptcha';
import { useNavigate } from '@solidjs/router';
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
		const data = {
			captcha_key: captchaToken(),
			gift_code_sku_id: null,
			login: email(),
			login_source: null,
			password: password(),
			undelete: false,
		};
		const response = await fetch(url, {
			method: 'POST',

			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(data),
		});
		let resData = await response.json();
		if (typeof resData?.captcha_key !== 'undefined') {
			if (resData?.captcha_key[0] == 'captcha-required') {
				setShowCaptcha(true);
				setCaptchaKey(resData.captcha_sitekey);
			}
		}

		console.log(resData);
		if (resData.token == null && resData.sms == true) {
			LoginState.setTicket(resData.ticket);
			navigate('/login/mfa');
		}
	}

	return (
		<div>
			<h1>Hemlo</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					logIn();
				}}
			>
				<input
					onChange={(e) => {
						setEmail((e.target as HTMLTextAreaElement).value);
					}}
				/>
				<input
					type="password"
					onChange={(e) => {
						setPassword((e.target as HTMLTextAreaElement).value);
					}}
				/>
				<input type="submit" />
			</form>

			<Show when={showCaptcha()}>
				{/* TODO: GET AFTER FAILED LOGIN ATTEMPT */}
				<HCaptcha
					sitekey={captchaKey()}
					onVerify={(token) => setCaptchaToken(token)}
				/>
			</Show>
		</div>
	);
};
export default Main;
