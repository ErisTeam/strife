/** @format */

import { InputType } from './../types';
import style from './Input.module.css';

interface InputProps {
	type: InputType;
	placeholder?: string;
	width?: number;

	disabled?: boolean;
	required?: boolean;
	autocomplete?: 'on' | 'off';

	maxLength?: number;
	minLength?: number;

	pattern?: string;

	class?: string;
	onChange?: (e: any) => void;
}

function Input(prop: InputProps) {
	return (
		<input
			style={'width:' + (prop.width ? `${prop.width}rem` : '100%')}
			class={[prop.class, style.input].join(' ')}
			type={prop.type}
			placeholder={prop.placeholder}
			disabled={prop.disabled}
			required={prop.required}
			autocomplete={prop.autocomplete}
			maxLength={prop.maxLength}
			minLength={prop.minLength}
			pattern={prop.pattern}
			onchange={prop.onChange}
		/>
	);
}

export default Input;
