import { appWindow } from '@tauri-apps/api/window';

const WindowDecoration = () => {
	return (
		<div data-tauri-drag-region>
			<button
				onclick={() => {
					appWindow.close();
				}}
			>
				Close
			</button>
			<button
				onclick={() => {
					appWindow.minimize();
				}}
			>
				Minimize
			</button>
			<button
				onclick={() => {
					appWindow.toggleMaximize();
				}}
			>
				Maximize
			</button>
		</div>
	);
};
export default WindowDecoration;
