/** @format */

import style from './Switch.module.css';

type SwitchProps = {
	disabled?: boolean;

	onChange?: (e: Event) => void;
};

function Switch(prop: SwitchProps) {
	return (
		<label class={style.switch}>
			<input type="checkbox" disabled={prop.disabled} />
			<span class={style.slider} />
		</label>
	);
}

export default Switch;
