/** @format */

/* Style */
import style from './../css.module.css';
import inputs from './../../../Styles/Inputs.module.css';
import buttons from './../../../Styles/Buttons.module.css';
import Checkbox from '../../Checkbox/Checkbox';

/* Solid */
import { createSignal } from 'solid-js';
import { t } from '../../../Translation';
import Switch from '../../Switch/Switch';

type LoginBoxProps = {
	class?: string;
	login: (name: string, password: string, captcha_token?: string) => Promise<void>;
};

function LoginBox(prop: LoginBoxProps) {
	const [name, setName] = createSignal('');
	const [password, setPassword] = createSignal('');

	return (
		<form
			class={[style.loginBox, prop.class].join(' ')}
			onsubmit={(e) => {
				e.preventDefault();
				prop.login(name(), password()).catch((e) => {
					console.log(e); //TODO: handle error
				});
			}}
		>
			<h1 class={style.header}>{t.LoginPage.logIn()}</h1>
			
			{/* Name and password fields */}
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
			
			{/* Remember me and login button */}
			<fieldset class={style.bottomPart}>
				<label class={style.rememberMe} for='rememberMe'>
					<p>{t.LoginPage.rememberMe()}</p>
					<Checkbox id='rememberMe'/>
				</label>
				<button class={[style.loginButton, buttons.default].join(' ')} type="submit">
					{t.LoginPage.logIn()}
				</button>
			</fieldset>
		</form>
	);
}

export default LoginBox;
