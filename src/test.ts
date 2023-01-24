/*@once*/
import { invoke, tauri } from '@tauri-apps/api';
import { listen, Event, UnlistenFn } from '@tauri-apps/api/event';
import { onCleanup } from 'solid-js';

async function startMobileAuthListener(
	on_event: (event: Event<string>) => void
): Promise<UnlistenFn> {
	console.log('start');
	return await listen('mobileAuth', on_event);
}

async function useTaurListener(callback: (event: Event<string>) => void) {
	let unlist = await listen('mobileAuth', callback);
	onCleanup(() => {
		console.log('cleanup');
		unlist();
	});
}

async function getToken(user_id: string) {
	return (await invoke('get_token', { id: user_id })) as string | null;
}

export { startMobileAuthListener as startListener, getToken, useTaurListener };
