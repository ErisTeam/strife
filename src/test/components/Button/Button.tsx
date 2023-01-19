/** @format */

import { ButtonType } from './../../types';
import style from './Button.module.css';
import './Button.module.css';

interface ButtonProps {
	type: ButtonType;
	value?: string;

	disabled?: boolean;

	children?: any;
	onChange?: (e: any) => void;
}

function Button(prop: ButtonProps) {
	return (
		<button type={prop.type} disabled={prop.disabled} value={prop.value} onChange={prop.onChange}>
			{prop.children}
		</button>
	);
}

export default Button;
