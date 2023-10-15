/** @format */

import { createSignal } from 'solid-js';
import style from './Switch.module.css';
import { onMount } from 'solid-js';

type SwitchProps = {
	disabled?: boolean;
    defaultChecked?: boolean,

	onChange?: (e: Event) => void;

	value?: boolean;
};

function Switch(props: SwitchProps) {
	return (
		<label class={style.switch}>
			<input checked={props.value} onchange={props.onChange} type="checkbox" disabled={props.disabled} />
			<span class={style.slider} />
		</label>
	);
}

export default Switch;
