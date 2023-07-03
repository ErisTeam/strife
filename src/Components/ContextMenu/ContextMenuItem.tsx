import style from './css.module.css';
interface IContextMenuItem {
	text?: string;
	icon?: any;
	fn?: VoidFunction;
}
const ContextMenuItem = (props: IContextMenuItem) => {
	return (
		<li class={style.contextMenuItem}>
			<button
				onClick={() => {
					if (!props.fn) return;

					props.fn();
				}}
			>
				<div class={style.icon}>{props.icon}</div>
				<span>{props.text}</span>
			</button>
		</li>
	);
};
export default ContextMenuItem;
