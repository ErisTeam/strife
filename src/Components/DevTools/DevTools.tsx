import { A } from '@solidjs/router';
import style from './DevTools.module.css';
import { createSignal } from 'solid-js';

export default () => {
	const [LastPos, setLastPos] = createSignal<{ x: number; y: number } | null>(null);
	const [isDragded, setIsDragged] = createSignal(false);

	function dragMouseDown(e: MouseEvent) {
		e.preventDefault();

		setLastPos({
			x: e.clientX,
			y: e.clientY,
		});
		setIsDragged(true);
	}

	function mouseMove(e: MouseEvent) {
		e.preventDefault();

		const target = e.target as HTMLElement;
	}

	return (
		<div onmousedown={dragMouseDown} onmousemove={mouseMove} class={[style.dev].join(' ')} id="dev">
			<A href="/">Prev</A>
		</div>
	);
};
