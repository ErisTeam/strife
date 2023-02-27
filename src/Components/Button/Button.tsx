/** @format */

import { ButtonType } from './../types';
import style from './Button.module.css';

interface ButtonProps {
	type: ButtonType;
	value?: string;

	disabled?: boolean;

	class?: string;
	children?: any;
	onClick?: (e: any) => void;
	onChange?: (e: any) => void;
}

function Button(prop: ButtonProps) {
	return (
		<button
			class={[style.button, prop.class].join(' ')}
			type={prop.type}
			disabled={prop.disabled}
			value={prop.value}
			onChange={prop.onChange}
			onClick={prop.onClick}
		>
			{prop.children}
		</button>
	);
}

export default Button;
