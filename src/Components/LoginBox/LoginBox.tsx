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
	login: any;
}

function LoginBox(prop: LoginBoxProps) {
	return (
		<form
			class={[style.container, prop.class].join(' ')}
			onsubmit={(e) => {
				e.preventDefault();
				prop.login(name(), password());
			}}
		>
			<h1 class={style.header}>Log In</h1>
			<fieldset class={style.inputs}>
				<input
					class={inputs.default}
					type="text"
					placeholder="Login"
					onChange={(e) => setName(e.currentTarget.value)}
				/>
				<input
					class={inputs.default}
					type="password"
					placeholder="Password"
					onChange={(e) => setPassword(e.currentTarget.value)}
				/>
			</fieldset>
			<fieldset class={style.bottomPart}>
				<label class={style.rememberMe}>
					<p>Remember me:</p>
					<input type="checkbox" class={checkboxes.default} />
				</label>
				<button class={[style.loginButton, buttons.default].join(' ')} type="submit">
					Login
				</button>
			</fieldset>
		</form>
	);
}

export default LoginBox;
