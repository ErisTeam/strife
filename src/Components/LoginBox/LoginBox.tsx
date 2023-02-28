/** @format */

/* Style */
import style from './LoginBox.module.css';

/* Components */
import Input from '../Input/Input';
import Button from '../Button/Button';
import CheckBox from '../CheckBox/CheckBox';

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
				<Input
					type="text"
					placeholder="Login"
					width={24}
					onChange={(e) => setName(e.currentTarget.value)}
				/>
				<Input
					type="password"
					placeholder="Password"
					width={24}
					onChange={(e) => setPassword(e.currentTarget.value)}
				/>
			</div>
			<div class={style.bottomPart}>
				<label class={style.rememberMe}>
					<p>Remember me:</p>
					<CheckBox />
				</label>
				<div class={style.buttons}>
					<Button
						class={style.loginButton}
						type="button"
						onClick={(e) => {
							login();
						}}
					>
						Login
					</Button>
				</div>
			</div>
		</div>
	);
}

export default LoginBox;
