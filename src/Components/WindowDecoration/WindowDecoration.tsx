import { appWindow } from '@tauri-apps/api/window';
import style from './css.module.css';
import { Maximize, Minimize, Minus, X } from 'lucide-solid';
import { Show, createEffect, createResource } from 'solid-js';

const WindowDecoration = () => {
	const [isMaxmized, setIsMaxmized] = createResource(async () => {
		return await appWindow.isMaximized();
	});
	appWindow
		.onResized(() => {
			console.log('resized');
			setIsMaxmized.refetch();
		})
		.catch((e) => console.log(e));
	return (
		<div class={style.decoration} data-tauri-drag-region>
			<h1>PandaCord</h1>

			<div class={style.buttons}>
				<button
					onclick={() => {
						appWindow.minimize().catch((e) => console.log(e));
					}}
					title="Minimize window" //TODO: Why this exists?
				>
					<Minus />
				</button>
				<button
					onclick={() => {
						appWindow
							.toggleMaximize()
							.then()
							.catch((e) => console.log(e));
					}}
					title="Toggle Maximiation of window" //TODO: Why this exists?
				>
					<Show when={isMaxmized()} fallback={<Maximize />}>
						<Minimize />
					</Show>
				</button>
				<button
					onclick={() => {
						appWindow.close().catch((e) => console.log(e));
					}}
					title="Close window" //TODO: Translate
				>
					<X />
				</button>
			</div>
		</div>
	);
};
export default WindowDecoration;
