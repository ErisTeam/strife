import { Component, For, Match, Show, Switch, createMemo } from 'solid-js';
import { createStore, produce, reconcile } from 'solid-js/store';

//import checkBoxes from '../../Styles/Checkboxes.module.css';
import inputs from '../../Styles/Inputs.module.css';

import SwitchInput from '../Switch/Switch';

import { useAppState } from '../../AppState';
import { Dynamic } from 'solid-js/web';
import { RotateCcw, X } from 'lucide-solid';
import { CssNumberPropertySetting, CssPropertyType, CustomSettings, SettingsEntry } from './SettingsTypes';
import style from './Settings.module.css';
import CssPropertyInput from './CssPropertyInput';
import Checkbox from '../Checkbox/Checkbox';
import { hslToHexCss } from '@/API/Style';
import { saveToFile } from '@/API/Settings';

function updateSettingsEntry(index: number, newValue: any) {
	const AppState = useAppState();

	const entry = AppState.settings.entries[index];
	if (entry.formatValue) {
		newValue = entry.formatValue(newValue as never);
	}

	AppState.settings.setEntries(
		index,
		produce((draft) => {
			draft.value = newValue;
		}),
	);

	dispatchEvent(new CustomEvent(`settingsChanged`, { detail: { id: entry.id } }));

	console.log(AppState.settings.entries);
	saveToFile();
}

export default (props: { setting: SettingsEntry; index: number }) => {
	let value = createMemo(() => {
		let value = props.setting.value == null ? props.setting.defaultValue : props.setting.value;

		if (props.setting.type == 'ColorPicker') {
			if (typeof value == 'string' && value.startsWith('hsl')) {
				value = hslToHexCss(value);
			}
		}

		return value;
	});

	function updateSetting(e: Event | any) {
		let value: any;
		if (e.target.type == 'checkbox') {
			value = e.target.checked;
		} else if (e.target.type == 'date') {
			value = new Date(e.target.value);
		} else if (e.target != null) {
			value = e.target.value;
		} else {
			value = e;
		}

		console.log(props, value);
		updateSettingsEntry(props.index, value);
	}
	function reset() {
		updateSettingsEntry(props.index, props.setting.defaultValue);
	}

	console.log(props, value());
	return (
		<section
			class={style.entry}
			classList={{
				[style.showResetButton]: props.setting.value != null && props.setting.value != props.setting.defaultValue,
			}}
		>
			<h3 class={style.title}>{props.setting.title}</h3>
			<span class={style.description}>{props.setting.description}</span>
			<span class={style.input}>
				<Switch>
					<Match when={props.setting.type == 'Checkbox'}>
						<Checkbox onChange={updateSetting} checked={value() as boolean} />
					</Match>
					<Match when={props.setting.type == 'Switch'}>
						<SwitchInput value={value() as boolean} onChange={updateSetting} />
					</Match>
					<Match when={props.setting.type == 'TextInput'}>
						<input
							title={props.setting.title}
							type="text"
							value={value() as string}
							class={inputs.default}
							oninput={updateSetting}
						/>
					</Match>
					<Match when={props.setting.type == 'NumberInput'}>
						<input
							title={props.setting.title}
							type="number"
							value={value() as number}
							class={inputs.default}
							oninput={updateSetting}
						/>
					</Match>
					<Match when={props.setting.type == 'DateInput'}>
						<input
							title={props.setting.title}
							type="date"
							value={(value() as Date).toISOString().split('T')[0]}
							class={inputs.default}
							onchange={updateSetting}
						/>
					</Match>
					<Match when={props.setting.type == 'ColorPicker'}>
						<input
							title={props.setting.title}
							type="color"
							value={value() as string}
							class={inputs.default + ' ' + inputs.colorPicker}
							oninput={updateSetting}
						/>
					</Match>
					<Match when={props.setting.type == 'CssNumberProperty'}>
						<CssPropertyInput
							value={value() as CssPropertyType}
							units={(props.setting as CssNumberPropertySetting).units}
							onChange={updateSettingsEntry.bind(null, props.index)}
						/>
					</Match>

					<Match when={props.setting.type == 'Custom'}>
						<Dynamic
							component={(props.setting as CustomSettings).component}
							{...(props.setting as CustomSettings).props}
						/>
					</Match>
				</Switch>
				<button class={style.showResetButton + ' ' + style.resetButton} onclick={reset} title="Reset to default value">
					<RotateCcw />
				</button>
			</span>
		</section>
	);
};
