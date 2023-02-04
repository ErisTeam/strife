import { Component, createSignal, Show } from 'solid-js';
import { useLoginState } from './LoginState';
import { useAppState } from '../../AppState';
import { useNavigate } from '@solidjs/router';

//todo remove
const MFA = () => {
	const [MFACode, setMFACode] = createSignal('');
	const [useSMS, setUseSMS] = createSignal(false);
	const LoginState: any = useLoginState();
	const AppState: any = useAppState();
	const navigate = useNavigate();
	async function sendSMS() {
		const url = 'https://discord.com/api/v9/auth/mfa/sms/send';
		const data = {
			ticket: LoginState.ticket(),
		};
		const response = await fetch(url, {
			method: 'POST',

			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		let resData = await response.json();
		console.log(resData);
		setUseSMS(true);
	}

	async function verifyMFA() {
		if (useSMS() == true) {
			const url = 'https://discord.com/api/v9/auth/mfa/sms';
			const data = {
				code: MFACode(),
				ticket: LoginState.ticket(),
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

			LoginState.setToken(resData.token);
			AppState.setUserToken(resData.token);
			localStorage.setItem('userToken', resData.token);
			console.log(AppState.userToken());
			navigate('/app');

			/* TODO: send to rust to open gateway */
		} else {
			const url = 'https://discord.com/api/v9/auth/mfa/totp';
			const data = {
				code: MFACode(),
				ticket: LoginState.ticket(),
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
			LoginState.setToken(resData.token);
			AppState.setUserToken(resData.token);
			localStorage.setItem('userToken', resData.token);
			console.log(AppState.userToken());
			navigate('/app');
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
