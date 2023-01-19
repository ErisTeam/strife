/** @format */

import { Setter } from 'solid-js';
import { InputType } from './../../types';
import './Input.module.css';

interface InputProps {
	type: InputType;
	placeholder?: string;

	disabled?: boolean;
	required?: boolean;
	autocomplete?: 'on' | 'off';

	maxLength?: number;
	minLength?: number;

	pattern?: string;

	onChange?: (e: any) => void;
}

function Input(prop: InputProps) {
	return (
		<input
			type={prop.type}
			placeholder={prop.placeholder}
			disabled={prop.disabled}
			required={prop.required}
			autocomplete={prop.autocomplete}
			maxLength={prop.maxLength}
			minLength={prop.minLength}
			pattern={prop.pattern}
			onchange={prop.onChange}
		></input>
	);
}

export default Input;
