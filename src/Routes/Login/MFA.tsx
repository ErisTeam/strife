// SolidJS
import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';

// API
import { useLoginState } from './LoginState';
import { useAppState } from '../../AppState';

// TODO: remove
const MFA = () => {
	const LoginState: any = useLoginState();
	const AppState: any = useAppState();
	const [MFACode, setMFACode] = createSignal('');
	const [useSMS, setUseSMS] = createSignal(false);
	const navigate = useNavigate();

	async function sendSMS() {
		const url = 'https://discord.com/api/v9/auth/mfa/sms/send';
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				ticket: LoginState.ticket(),
			}),
		});

		// TODO: Delete after testing
		let resData = await response.json();
		console.log(resData);

		setUseSMS(true);
	}

	async function verifyMFA() {
		if (useSMS() == true) {
			const url = 'https://discord.com/api/v9/auth/mfa/sms';
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					"Content-Type": "application/json",
				},
				credentials: 'include',
				body: JSON.stringify({
					code: MFACode(),
					ticket: LoginState.ticket(),
				}),
			});

			let resData = await response.json();

			LoginState.setToken(resData.token);
			AppState.setUserToken(resData.token);

			// WARNING: Gami is a furry! VVV
			localStorage.setItem('userToken', resData.token);

			console.log(AppState.userToken());
			navigate("/app");

			/* TODO: send to rust to open gateway */
		} else {
			const url = 'https://discord.com/api/v9/auth/mfa/totp';
			const response = await fetch(url, {
				method: "POST",

				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",

				body: JSON.stringify({
					code: MFACode(),
					ticket: LoginState.ticket(),
				}),
			});

			let resData = await response.json();

			LoginState.setToken(resData.token);
			AppState.setUserToken(resData.token);

			// WARNING: Gami is a furry! VVV
			localStorage.setItem('userToken', resData.token);

			console.log(AppState.userToken());
			navigate("/app");
		}
	}

	return (
		<div>
			<h1>Enter MFA Code</h1>
			<p>{LoginState.ticket()}</p>
			<label>
				<input
					placeholder="MFA Code"
					name="mfa"
					type="text"
					onChange={(e) => {
						setMFACode((e.target as HTMLTextAreaElement).value);
					}}
				/>
			</label>

			<button onClick={() => sendSMS()}>Send SMS</button>
			<button onClick={() => verifyMFA()}>Continue</button>
		</div>
	);
};
export default MFA;
