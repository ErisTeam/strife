// SolidJS
import { createEffect, onCleanup } from 'solid-js';

// Tauri
import { listen, Event, UnlistenFn, emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';

async function startListener<T = string>(
	eventName: string,
	on_event: (event: Event<T>) => void
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

interface GatewayEvent {
	user_id: string;
}

function startGatewayListener<T extends GatewayEvent>(
	user_id: string,
	on_event: (event: Event<T>) => void
) {
	createEffect(() => {
		console.log('start gateway');
		let unlist = listen('gateway', (event: Event<T>) => {
			//if (event.payload.user_id === user_id) {
			on_event(event);
			//}
		});
		onCleanup(async () => {
			console.log('cleanup');
			(await unlist)();
		});
		return;
	});
}

async function changeState(newState: 'LoginScreen' | 'Application') {
	await invoke('set_state', { newState });
}

export { startListener, useTaurListener, changeState, startGatewayListener };
