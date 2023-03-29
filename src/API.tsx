// SolidJS
import { useAppState } from './AppState';
import { listen, Event, UnlistenFn, emit } from '@tauri-apps/api/event';
// Tauri
import { invoke } from '@tauri-apps/api/tauri';
import { createEffect, getOwner, onCleanup } from 'solid-js';
// API
import { GuildType, ChannelType, Relationship } from './discord';
interface GatewayEvent {
	user_id: string;
	type: string;
}
interface a<T> {
	eventName: string;
	listener: (event: T) => void;
}

const AppState: any = useAppState();
type Listener = {
	on: <T>(eventName: string, listener: (event: T) => void) => () => void;
	cleanup: () => void;
};
const tryOnCleanup: typeof onCleanup = (fn) => (getOwner() ? onCleanup(fn) : fn);
function useTaurListener<T>(eventName: string, on_event: (event: Event<T>) => void) {
	const unlist = listen(eventName, on_event);
	return tryOnCleanup(async () => {
		console.log('cleanup', eventName);
		(await unlist)();
	});
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
		on: <T,>(eventName: string, listener: (event: T) => void) => {
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
async function gatewayOneTimeListener<T>(userId: string, eventName: string) {
	return new Promise((resolve: (value: T) => void) => {
		let a = startGatewayListener(userId);
		a.on(eventName, (event: T) => {
			a.cleanup();
			resolve(event);
		});
	});
}

export default {
	async getUserData(userId: string) {
		let res = oneTimeListener<{ type: string; user_id: string; data: any }>('general', 'userData');
		await emit('getUserData', { userId });

		return (await res).data;
	},
	async getRelationships(userId: string) {
		let res = oneTimeListener<{ type: string; user_id: string; data: any }>('general', 'relationships');
		await emit('getRelationships', { userId });
		return (await res).data;
	},
	async getGuilds(userId: string) {
		let res = oneTimeListener<{ type: string; user_id: string; data: any }>('general', 'guilds');
		await emit('getGuilds', { userId });
		console.log('getGuilds', await res);
		return (await res).data;
	},

	/**
	 * Get messages of the given channel.
	 * @param channelId
	 * @returns
	 */
	async getMessages(channelId: string) {
		let token = await this.getToken();
		if (!token) {
			console.error("No user token found! Can't get messages!");
			return;
		}

		const url = `https://discord.com/api/v9/channels/${channelId}/messages?limit=50`;
		const resDataponse = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: token,
			},
		});

		let resData = await resDataponse.json();

		return resData;
	},

	/**
	 * Sends a message to the requested channel.
	 * @param channelId
	 * @param content
	 * @param reference
	 * @returns
	 */
	async sendMessage(channelId: string, content: string, reference: any) {
		let token = await this.getToken();
		if (!token) {
			console.error("No user token found! Can't send message!");
			return;
		}

		const url = `https://discord.com/api/v9/channels/${channelId}/messages`;
		const resDataponse = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: token,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				content: content,
				flags: 0,
				nonce: Date.now(),
				tts: false,
				message_reference: reference,
			}),
		});

		let resData = await resDataponse.json();

		console.log(resData);
		return resData;
	},

	/**
	 * Edits a message in the requested channel.
	 * @param channelId
	 * @param messageId
	 * @param content
	 * @returns edited message
	 */
	async editMessage(channelId: string, messageId: string, content: string) {
		let token = await this.getToken();
		if (!token) {
			console.error("No user token found! Can't edit message!");
			return;
		}
		let res = await fetch('https://discord.com/api/v9/channels/' + channelId + '/messages/' + messageId, {
			method: 'PATCH',
			headers: {
				Authorization: token,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				content: content,
			}),
		});
		let resData = await res.json();
		return resData;
	},

	/**
	 * Sends a request to the Rust API to get the user's token
	 * @param user_id
	 */
	async getToken(userId: string = AppState.userID()) {
		return (await invoke('get_token', { userId })) as string | null;
	},

	async updateCurrentUserID() {
		let response = await invoke('get_last_user');
		AppState.setUserID(response);
		return;
	},

	async updateCurrentChannels(id: string) {
		let token = await this.getToken();
		if (!token) {
			console.error("No user token found! Can't update current channels!");
			return;
		}

		AppState.setCurrentGuildChannels([]);

		const url = `https://discord.com/api/v9/guilds/${id}/channels`;
		const resDataponse = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: token,
			},
		});

		let resData = await resDataponse.json();

		resData.forEach((e: any) => {
			let channel: ChannelType = {
				id: e.id,
				name: e.name,
				type: e.type,
				topic: e.topic,
				position: e.position,
				permission_overwrites: e.permission_overwrites,
				parent_id: e.parent_id,
			};
			AppState.setCurrentGuildChannels((prev: any) => [...prev, channel]);
		});
	},

	async updateGuilds() {
		console.log(await this.getGuilds(AppState.userID()));
		let guilds: GuildType[] = await this.getGuilds(AppState.userID());

		// for (const guild of guilds){
		// 	guild.
		// }

		// let guild: GuildType = {
		// 	id: res.id,
		// 	name: res.name,
		// 	icon: res.icon,
		// 	description: res.description,
		// 	splash: res.splash,
		// 	member_count: res.approximate_member_count,
		// 	presence_count: res.approximate_presence_count,
		// 	features: res.features,
		// 	banner: res.banner,
		// 	ownerId: res.owner_id,
		// 	roles: res.roles,
		// 	system_channel_id: res.system_channel_id,
		// };

		// AppState.setUserGuilds((prev: any) => [...prev, guild]);
	},

	async updateRelationships() {
		// const relationship: Relationship = {
		// 	id: e.id,
		// 	type: e.type,
		// 	user: {
		// 		avatar: e.user.avatar,
		// 		avatar_decoration: e.user.avatar_decoration,
		// 		discriminator: e.user.discriminator,
		// 		display_name: e.user.display_name,
		// 		id: e.user.id,
		// 		public_flags: e.user.public_flags,
		// 		username: e.user.username,
		// 	},
		// };
		// AppState.setRelationshpis((prev: any) => [...prev, relationship]);
	},
};
