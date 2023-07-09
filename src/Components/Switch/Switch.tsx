/** @format */

import style from './Switch.module.css';
import './Switch.module.css';

interface SwitchProps {
	rounded?: boolean;

	disabled?: boolean;

	onChange?: (e: any) => void;
}

function Switch(prop: SwitchProps) {
	return (
		<label class={style.switch} classList={{ [style.rounded]: prop.rounded }}>
			<input type="checkbox" disabled={prop.disabled} />
			<span class={style.slider} classList={{ [style.rounded]: prop.rounded }} />
		</label>
	);
}

export default Switch;
