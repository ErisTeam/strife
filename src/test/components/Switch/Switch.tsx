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
		<label class={[style.switch, prop.rounded ? style.rounded : ''].join(' ')}>
			<input type='checkbox' disabled={prop.disabled} />
			<span class={[style.slider, prop.rounded ? style.rounded : ''].join(' ')} />
		</label>
	);
}

export default Switch;
