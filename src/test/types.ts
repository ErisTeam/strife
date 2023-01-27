type InputType =
	| 'text'
	| 'number'
	| 'email'
	| 'password'
	| 'search'
	| 'hidden'
	| string;
type ButtonType = 'button' | 'submit' | 'reset';
type TextAreaType = 'soft' | 'hard' | 'off';

export type { InputType, ButtonType, TextAreaType };
