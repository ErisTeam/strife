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
import { useTrans } from '../../Translation';
const [name, setName] = createSignal('');
const [password, setPassword] = createSignal('');

interface LoginBoxProps {
	class?: string;
	login: any;
}

function LoginBox(prop: LoginBoxProps) {
	const [t] = useTrans();

	return (
		<form
			class={[style.container, prop.class].join(' ')}
			onsubmit={(e) => {
				e.preventDefault();
				prop.login(name(), password());
			}}
		>
			<h1 class={style.header}>{t.LoginPage.logIn()}</h1>
			<fieldset class={style.inputs}>
				<input
					class={inputs.default}
					type="text"
					placeholder={t.LoginPage.login()}
					onChange={(e) => setName(e.currentTarget.value)}
				/>
				<input
					class={inputs.default}
					type="password"
					placeholder={t.LoginPage.password()}
					onChange={(e) => setPassword(e.currentTarget.value)}
				/>
			</fieldset>
			<fieldset class={style.bottomPart}>
				<label class={style.rememberMe}>
					<p>{t.LoginPage.rememberMe()}</p>
					<input type="checkbox" class={checkboxes.default} />
				</label>
				<button class={[style.loginButton, buttons.default].join(' ')} type="submit">
					{t.LoginPage.logIn()}
				</button>
			</fieldset>
		</form>
	);
}

export default LoginBox;
