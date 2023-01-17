/** @format */

import { InputType } from './../../types';
import './Input.module.css';

interface InputProps {
	type: InputType;
	placeholder?: string;
	disabled?: boolean;

	maxLength?: number;
	minLength?: number;

	onChange: (e: any) => void;
}

function Input(prop: InputProps) {
	return <input type={prop.type} placeholder={prop.placeholder}></input>;
}

export default Input;
