/** @format */

/* Style */
import style from './LoginBox.module.css';
import inputs from './../../Styles/Inputs.module.css';
import checkboxes from './../../Styles/Checkboxes.module.css';
import buttons from './../../Styles/Buttons.module.css';

/* Tauri */
import { emit } from '@tauri-apps/api/event';

/* Solid */
import { createSignal } from 'solid-js';

const [name, setName] = createSignal('');
const [password, setPassword] = createSignal('');

interface LoginBoxProps {
	class?: string;
}

async function login(captcha_token: string | null = null) {
	await emit('login', {
		captchaToken: captcha_token,
		login: name(),
		password: password(),
	});
}

function LoginBox(prop: LoginBoxProps) {
	return (
		<div class={[style.container, prop.class].join(' ')}>
			<h1 class={style.header}>Log In</h1>
			<div class={style.inputs}>
				<input
					class={inputs.default}
					type="text"
					placeholder="Login"
					width={24}
					onChange={(e) => setName(e.currentTarget.value)}
				/>
				<input
					class={inputs.default}
					type="password"
					placeholder="Password"
					width={24}
					onChange={(e) => setPassword(e.currentTarget.value)}
				/>
			</div>
			<div class={style.bottomPart}>
				<label class={style.rememberMe}>
					<p>Remember me:</p>
					<input type="checkbox" class={checkboxes.default} />
				</label>
				<div class={style.buttons}>
					<button
						class={[style.loginButton, buttons.default].join(' ')}
						type="button"
						onClick={(e) => {
							login();
						}}
					>
						Login
					</button>
				</div>
			</div>
		</div>
	);
}

export default LoginBox;
