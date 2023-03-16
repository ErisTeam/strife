// SolidJS
import { createEffect, onCleanup } from 'solid-js';

// Tauri
import { listen, Event, UnlistenFn, emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';

function useTaurListener<T>(eventName: string, on_event: (event: Event<T>) => void) {
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
	type: string;
}
interface a<T> {
	eventName: string;
	listener: (event: T) => void;
}
function startGatewayListener(user_id: string) {
	let listeners = new Set<{ eventName: string; listener: (event: any) => void }>();
	console.log('start gateway NEW');
	useTaurListener<GatewayEvent>('gateway', (event: Event<GatewayEvent>) => {
		if (event.payload.user_id === user_id) {
			console.log('gateway event', event.payload.type);
			listeners.forEach((l) => {
				console.log('gateway event', event.payload.type, l.eventName);
				if (l.eventName === event.payload.type) {
					l.listener(event.payload);
				}
			});
		}
	});
	return {
		on: <T>(eventName: string, listener: (event: T) => void) => {
			listeners.add({ eventName, listener });
			console.log('add listener', eventName);
			return onCleanup(listeners.delete.bind(listeners, { eventName, listener }));
		},
	};
}

async function one_time_listener<T>(userId: string, eventName: string): Promise<T> {
	return new Promise((resolve) => {
		let a = startGatewayListener(userId).on(eventName, (event: T) => {
			a();
			resolve(event);
		});
	});
}

async function changeState(newState: 'LoginScreen' | 'Application') {
	await invoke('set_state', { newState });
}

async function startGateway(userId: string) {
	await emit('startGateway', { user_id: userId });
}

export { useTaurListener, changeState, startGatewayListener, startGateway };
