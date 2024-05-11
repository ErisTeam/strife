import { Component } from 'solid-js';

export interface SettingsCategory {
	title: string;
	description: string;
	groups: SettingsGroup[];
	//TODO: implement
	canBeLoadedFromFile?: boolean;
}
export interface SettingsGroup {
	title: string;
	description: string;
	entriesIds: string[];
	canBeLoadedFromFile?: boolean;
}

interface SettingsBase<V> {
	title: string;
	id: string;
	description: string;
	type: SettingsTypes;
	defaultValue?: V;
	value?: V;

	//TODO: change name
	//transform value before saving
	formatValue?: (value: V) => V;
}
//TODO: implement
interface NumberBasedSetting<V> extends SettingsBase<V> {
	min?: number;
	max?: number;
	step?: number;
}
interface CheckBoxSetting extends SettingsBase<boolean> {
	type: 'Checkbox';
}
interface SwitchSetting extends SettingsBase<boolean> {
	type: 'Switch';
}
interface TextInputSetting extends SettingsBase<string> {
	type: 'TextInput';
}
interface NumberInput extends NumberBasedSetting<number> {
	type: 'NumberInput';
}
//TODO: implement
interface SliderSetting extends NumberBasedSetting<number> {
	type: 'Slider';
}
interface SelectSetting extends SettingsBase<string> {
	type: 'Select';
	options: string[];
}
export type CssPropertyType = {
	value: number;
	unit: string;
};
export interface CssNumberPropertySetting extends NumberBasedSetting<CssPropertyType> {
	type: 'CssNumberProperty';
	units: string[];
}

interface DateInput extends SettingsBase<Date | string> {
	type: 'DateInput';
	maxDate?: Date; //TODO: implement
	minDate?: Date; //TODO: implement
}
interface ColorPicker extends SettingsBase<string> {
	type: 'ColorPicker';
}

export interface CustomSettings<P = object, V = unknown> extends SettingsBase<V> {
	type: 'Custom';
	component: Component;
	props?: P;
	//replaces whole settings entry with custom component
	fullyCustom?: boolean;
}
export type SettingsEntry =
	| CustomSettings
	| CheckBoxSetting
	| SwitchSetting
	| TextInputSetting
	| NumberInput
	| DateInput
	| ColorPicker
	| SelectSetting
	| CssNumberPropertySetting
	| SliderSetting;
export type SettingsTypes =
	| 'Checkbox'
	| 'Switch'
	| 'TextInput'
	| 'NumberInput'
	| 'DateInput'
	| 'ColorPicker'
	| 'Slider'
	| 'Select'
	| 'CssNumberProperty'
	| 'Custom';
