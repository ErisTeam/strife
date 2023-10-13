import style from "./Checkbox.module.css";
import { CheckIcon } from "lucide-solid";

interface CheckboxProps {
    id?: string,
    defaultChecked?: boolean,
    // `ChangeEventHandlerUnion<HTMLInputElement, Event>` isn't exported... so `any` for now
    onChange?: (event: any) => void;
}

export default function Checkbox(props: CheckboxProps) {
    return (
        <div class={style.container}>
            <input id={props.id} type="checkbox" class={style.default} onChange={props.onChange} />
            <CheckIcon class={style.checkIcon} />
        </div>
    )
}
