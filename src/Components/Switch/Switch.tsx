/** @format */

import style from './Switch.module.css';
import './Switch.module.css';

interface SwitchProps {
	disabled?: boolean;

	onChange?: (e: any) => void;
}

function Switch(prop: SwitchProps) {
	return (
		<label class={style.switch}>
			<input type="checkbox" disabled={prop.disabled} />
			<span class={style.slider} />
		</label>
	);
}

export default Switch;
