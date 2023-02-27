/** @format */

import style from './LoginBox.module.css';
import Input from '../Input/Input';
import Button from '../Button/Button';
import CheckBox from '../CheckBox/CheckBox';

function LoginBox() {
	return (
		<div class={style.container}>
			<h1 class={style.header}>Log In</h1>
			<div class={style.inputs}>
				<Input
					type="text"
					placeholder="Login"
					width={24}
					// onChange={(e) => setName(e.currentTarget.value)}
				/>
				<Input
					type="password"
					placeholder="Password"
					width={24}
					// onChange={(e) => setPassword(e.currentTarget.value)}
				/>
			</div>
			<div class={style.bottomPart}>
				<label class={style.rememberMe}>
					<p>Remember me:</p>
					<CheckBox />
				</label>
				<div class={style.buttons}>
					<Button class={style.loginButton} type="button">
						Login
					</Button>
				</div>
			</div>
		</div>
	);
}

export default LoginBox;
