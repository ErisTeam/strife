// SolidJS
import { createEffect, getOwner, onCleanup } from 'solid-js';

// Tauri
import { listen, Event, UnlistenFn, emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';

type Listener = {
	on: <T>(eventName: string, listener: (event: T) => void) => () => void;
	cleanup: () => void;
};

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

	let clean_up = useTaurListener<T>(eventName, (event: Event<T>) => {
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
		cleanup: () => {
			console.log('a', clean_up);
			clean_up();
		},
	} as Listener;
}

function startGatewayListener(userId: string) {
	return startListener<GatewayEvent>('gateway', (event) => event.user_id === userId);
}
interface i {
	type: string;
}
interface messageCreate extends i {
	type: 'messageCreate';
	user_id: string;
	data: {
		content: string;
		author: {
			username: string;
		};
		id: string;
		timestamp: string;
		channel_id: string;
	};
}
function onMessageCreate(listener: Listener, channelId: string) {
	return listener.on<messageCreate>('messageCreate', (event) => {
		if (event.data.channel_id === channelId) {
			console.log('message', event);
		}
	});
}

async function oneTimeListener<T extends { type: string }>(
	event: string,
	eventName: string,
	condition: ((event: T) => boolean) | null = null
): Promise<T> {
	return new Promise((resolve) => {
		let a = startListener<T>(event, condition);
		a.on(eventName, (event: T) => {
			console.log('a', a.cleanup, a);
			a.cleanup();

			resolve(event);
		});
	});
}

async function changeState(newState: 'LoginScreen' | 'Application') {
	await invoke('set_state', { newState });
}

async function startGateway(userId: string) {
	await emit('startGateway', { userId });
}

async function gatewayOneTimeListener<T>(userId: string, eventName: string) {
	return new Promise((resolve: (value: T) => void) => {
		let a = startGatewayListener(userId);
		a.on(eventName, (event: T) => {
			a.cleanup();
			resolve(event);
		});
	});
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

};

export type { Listener };
