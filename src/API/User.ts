import { Relationship } from '@/types/User';
import { emit } from '@tauri-apps/api/event';
import { oneTimeListener } from '@/test';
import { useAppState } from '@/AppState';
import { invoke } from '@tauri-apps/api/tauri';
export async function activateUser(userId: string) {
	console.log('activating user', userId);
	return await invoke('activate_user', { userId });
}
export async function getRelationships(userId: string) {
	const res = oneTimeListener<{ type: string; user_id: string; data: { relationships: Relationship[] } }>(
		'general',
		'relationships',
	);
	console.log("getting user's relationships");
	await emit('getRelationships', { userId });
	console.log('getRelationships', await res);
	return (await res).data.relationships;
}
export async function getLocalUserInfo(userId: string) {
	return (await invoke('get_user_info', { userId })) as any;
}

/**
 * Sends a request to the Rust API to get the user's token
 * @param user_id
 */
export async function getToken(userId: string = ''): Promise<string | null> {
	const AppState = useAppState();
	if (!userId) userId = AppState.userId();
	return await invoke('get_token', { userId });
}
export async function updateRelationships() {
	const AppState = useAppState();
	AppState.setRelationships([]);
	console.warn('updating relationships');
	const relationships = await getRelationships(AppState.userId());
	console.log(relationships);
	AppState.setRelationships(relationships);
}
export async function updateCurrentUserID() {
	const response = await invoke('get_last_user');
	const AppState = useAppState();

	AppState.setUserId(response as string);
	return;
}
