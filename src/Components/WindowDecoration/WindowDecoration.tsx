import { invoke } from '@tauri-apps/api';

const WindowDecoration = () => {
	return (
		<div data-tauri-drag-region>
			<button
				onclick={() => {
					invoke('close_app').catch(console.error);
				}}
			>
				Close
			</button>
			<button
				onclick={() => {
					invoke('minimize_app').catch(console.error);
				}}
			>
				Minimize
			</button>
			<button
				onclick={() => {
					invoke('maximize_app').catch(console.error);
				}}
			>
				Maximize
			</button>
		</div>
	);
};
export default WindowDecoration;
