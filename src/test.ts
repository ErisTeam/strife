// SolidJS
import { createEffect, getOwner, onCleanup } from 'solid-js';

// Tauri
import { listen, Event, UnlistenFn, emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';

const tryOnCleanup: typeof onCleanup = (fn) => (getOwner() ? onCleanup(fn) : fn);

function useTaurListenerOld<T>(eventName: string, on_event: (event: Event<T>) => void) {
	createEffect(() => {
		const unlist = listen(eventName, on_event);
		onCleanup(async () => {
			console.log('cleanup');
			(await unlist)();
		});
	});
}
function useTaurListener<T>(eventName: string, on_event: (event: Event<T>) => void) {
	const unlist = listen(eventName, on_event);
	return tryOnCleanup(async () => {
		console.log('cleanup', eventName);
		(await unlist)();
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
function startListener<T extends { type: string }>(
	eventName: string,
	condition: ((event: T) => boolean) | null = null
) {
	let listeners = new Set<{ eventName: string; listener: (event: any) => void }>();
	console.log('start gateway NEW', eventName);

	useTaurListener<T>(eventName, (event: Event<T>) => {
		let run = true;
		console.log('event', event.payload);
		if (condition && !condition(event.payload)) {
			run = false;
		}
		if (run) {
			listeners.forEach((l) => {
				console.log(' event', event.payload.type, l.eventName);
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
			return tryOnCleanup(listeners.delete.bind(listeners, { eventName, listener }));
		},
	};
}

function startGatewayListener(userId: string) {
	return startListener<GatewayEvent>('gateway', (event) => event.user_id === userId);
}

async function oneTimeListener<T extends { type: string }>(
	event: string,
	eventName: string,
	condition: ((event: T) => boolean) | null = null
): Promise<T> {
	return new Promise((resolve) => {
		let a = startListener<T>(event, condition).on(eventName, (event: T) => {
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

async function gatewayOneTimeListener<T>(userId: string, eventName: string) {
	return new Promise((resolve: (value: T) => void) => {
		let a = startGatewayListener(userId).on(eventName, (event: T) => {
			a();
			console.log(a);
			resolve(event);
		});
	});
}

async function getUserData(userId: string) {
	let res = oneTimeListener<{ type: string; user_id: string; user_data: string }>('general', 'userData');
	await emit('getUserData', { user_id: userId });
	return await res;
}

type GatewayEvents = 'messageCreate' | 'userData';

export {
	useTaurListenerOld,
	useTaurListener,
	oneTimeListener,
	startListener,
	changeState,
	startGatewayListener,
	startGateway,
	gatewayOneTimeListener,
	getUserData,
};
