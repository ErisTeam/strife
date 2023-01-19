/** @format */

import style from './CheckBox.module.css';
import './CheckBox.module.css';

interface CheckBoxProps {
	value?: string;

	disabled?: boolean;

	children?: any;
	onChange?: (e: any) => void;
}

function CheckBox(prop: CheckBoxProps) {
	return <input type='checkbox' disabled={prop.disabled} value={prop.value} onChange={prop.onChange}></input>;
}

export default CheckBox;
