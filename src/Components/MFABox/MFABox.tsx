/* Style */
import style from './MFABox.module.css';
import inputs from './../../Styles/Inputs.module.css';
import checkboxes from './../../Styles/Checkboxes.module.css';
import buttons from './../../Styles/Buttons.module.css';

/* Tauri */
import { emit } from '@tauri-apps/api/event';

/* Solid */
import { createSignal } from 'solid-js';
const [code, setCode] = createSignal('');

interface MFABoxProps {
	class?: string;
	verify: any;
}

function MFABox(prop: MFABoxProps) {
	return (
		<form
			class={[style.container, prop.class].join(' ')}
			onsubmit={async (e) => {
				e.preventDefault();
				prop.verify(code());
			}}
		>
			<h1 class={style.header}>Enter your MFA Code</h1>
			<fieldset class={style.inputs}>
				<input
					class={inputs.default}
					type="text"
					placeholder="Login"
					onChange={(e) => setCode(e.currentTarget.value)}
				/>
			</fieldset>
			<fieldset class={style.bottomPart}>
				<button
					type="button"
					onclick={() => {
						emit('send_sms', {});
					}}
				>
					Send code via SMS
				</button>
				<button class={[style.loginButton, buttons.default].join(' ')} type="submit">
					Login
				</button>
			</fieldset>
		</form>
	);
}

export default MFABox;
