import style from './List.module.css';
import { JSX } from 'solid-js';
type ListProps = {
	title: string;
	className?: string;
	children?: JSX.Element | JSX.Element[];
};
export default (props: ListProps) => {
	return (
		<nav class={[props.className, style.list].join(' ')}>
			<h1>{props.title}</h1>
			<ol>{props.children}</ol>
		</nav>
	);
};
