/*@once*/
// SolidJS
import { onCleanup } from 'solid-js';

// Tauri
import { listen, Event, UnlistenFn } from '@tauri-apps/api/event';

async function startListener(
	eventName: string,
	on_event: (event: Event<string>) => void
): Promise<UnlistenFn> {
	console.log('start');
	return await listen(eventName, on_event);
}

async function useTaurListener(callback: (event: Event<string>) => void) {
	let unlist = await listen('mobileAuth', callback);
	onCleanup(() => {
		console.log('cleanup');
		unlist();
	});
}

export { startListener, useTaurListener };
