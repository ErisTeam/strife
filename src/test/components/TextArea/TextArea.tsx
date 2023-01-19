/** @format */

import { TextAreaType } from './../../types';
import style from './TextArea.module.css';
import './TextArea.module.css';

interface TextAreaProps {
	wrap?: TextAreaType;
	placeholder?: string;

	disabled?: boolean;
	required?: boolean;
	readonly?: boolean;
	autocomplete?: 'on' | 'off';

	rows?: number;
	cols?: number;
	maxLength?: number;

	pattern?: string;

	children?: any;

	onChange?: (e: any) => void;
}

function TextArea(prop: TextAreaProps) {
	return (
		<textarea
			wrap={prop.wrap}
			placeholder={prop.placeholder}
			disabled={prop.disabled}
			required={prop.required}
			readonly={prop.readonly}
			autocomplete={prop.autocomplete}
			rows={prop.rows}
			cols={prop.cols}
			maxLength={prop.maxLength}
		>
			{prop.children}
		</textarea>
	);
}

export default TextArea;
