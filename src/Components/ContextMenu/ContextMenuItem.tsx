import style from './css.module.scss';
interface IContextMenuItem {
	text?: string;
	icon?: any;
	fn?: VoidFunction;
	fnArgs?: any[];
}
const ContextMenuItem = (props: IContextMenuItem) => {
	return (
		<li class={style.contextMenuItem}>
			<button onClick={() => props.fn?.(...props.fnArgs)}>
				<div class={style.icon}>{props.icon}</div>
				<span>{props.text}</span>
			</button>
		</li>
	);
};
export default ContextMenuItem;
