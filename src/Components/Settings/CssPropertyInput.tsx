import { For } from 'solid-js';
import { CssPropertyType } from './SettingsTypes';
import inputs from '../../Styles/Inputs.module.css';

export default (props: { value: CssPropertyType; units: string[]; onChange?: (value: CssPropertyType) => void }) => {
	return (
		<section class={inputs.default}>
			<input
				title="CssPropertyInput" //PLACEHOLDER
				type="number"
				value={props.value.value}
				oninput={(e) =>
					props.onChange({
						value: parseInt((e.target as HTMLInputElement).value),
						unit: props.value.unit,
					})
				}
			/>
			<select
				title="CssPropertyInput" //PLACEHOLDER
				onchange={(e) => {
					props.onChange({
						value: props.value.value,
						unit: (e.target as HTMLSelectElement).value,
					});
				}}
			>
				<For each={props.units}>
					{(unit) => (
						<option value={unit} selected={unit == props.value.unit}>
							{unit}
						</option>
					)}
				</For>
			</select>
		</section>
	);
};
