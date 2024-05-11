import style from './Checkbox.module.css';
import { CheckIcon } from 'lucide-solid';

interface CheckboxProps {
	id?: string;
	checked?: boolean;
	// `ChangeEventHandlerUnion<HTMLInputElement, Event>` isn't exported... so `any` for now
	onChange?: (event: Event) => void;
}

export default function Checkbox(props: CheckboxProps) {
	//TODO: add title for accessibility
	return (
		<div class={style.container}>
			<input id={props.id} type="checkbox" class={style.default} onChange={props.onChange} checked={props.checked} />
			<CheckIcon class={style.checkIcon} />
		</div>
	);
}
