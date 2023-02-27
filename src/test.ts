// SolidJS
import { createEffect, onCleanup } from 'solid-js';

// Tauri
import { listen, Event, UnlistenFn, emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';

function useTaurListener<T>(
	eventName: string,
	on_event: (event: Event<T>) => void
) {
	createEffect(() => {
		const unlist = listen(eventName, on_event);
		onCleanup(async () => {
			console.log('cleanup');
			(await unlist)();
		});
	});
}

interface GatewayEvent {
	user_id: string;
}

function startGatewayListener<T extends GatewayEvent>(
	user_id: string,
	on_event: (event: Event<T>) => void
) {
	useTaurListener<T>('gateway', (event: Event<T>) => {
		if (event.payload.user_id === user_id) {
			on_event(event);
		}
	});
	console.log('start gateway');
}

async function changeState(newState: 'LoginScreen' | 'Application') {
	await invoke('set_state', { newState });
}

export { useTaurListener, changeState, startGatewayListener };
