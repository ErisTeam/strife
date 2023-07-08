/* Style */
import style from './css.module.css';
import inputs from './../../Styles/Inputs.module.css';

import buttons from './../../Styles/Buttons.module.css';
import { useTrans } from '../../Translation';
/* Tauri */
import { emit } from '@tauri-apps/api/event';

/* Solid */
import { createSignal } from 'solid-js';

interface MFABoxProps {
	class?: string;
	verify: (code: string) => Promise<void>;
}

function MFABox(prop: MFABoxProps) {
	const [t] = useTrans();
	const [code, setCode] = createSignal('');

	return (
		<form
			class={[style.MFABox, prop.class].join(' ')}
			onsubmit={async (e) => {
				e.preventDefault();
				prop.verify(code());
			}}
		>
			<h1 class={style.header}>{t.LoginPage.MFATitle()}</h1>
			<fieldset class={style.inputs}>
				<input
					class={inputs.default}
					type="text"
					placeholder={t.LoginPage.login()}
					onChange={(e) => setCode(e.currentTarget.value)}
				/>
			</fieldset>
			<fieldset class={style.bottomPart}>
				<button
					type="button"
					onclick={() => {
						emit('send_sms', {}); //TODO: wait for response and add response on rust side
					}}
				>
					{t.LoginPage.sendSMS()}
				</button>
				<button class={[style.loginButton, buttons.default].join(' ')} type="submit">
					{t.LoginPage.logIn()}
				</button>
			</fieldset>
		</form>
	);
}

export default MFABox;
