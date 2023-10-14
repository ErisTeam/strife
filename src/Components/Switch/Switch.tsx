/** @format */

import { createSignal } from 'solid-js';
import style from './Switch.module.css';
import { onMount } from 'solid-js';

type SwitchProps = {
	disabled?: boolean;
    defaultChecked?: boolean,

	onChange?: (e: Event) => void;
};

function Switch(props: SwitchProps) {
    const [checked, setChecked] = createSignal<boolean>()

    onMount(() => {setChecked(props.defaultChecked ?? false)});

	return (
		<label class={style.switch}>
			<input type="checkbox" disabled={props.disabled} checked={checked()}/>
			<span class={style.slider} />
		</label>
	);
}

export default Switch;
