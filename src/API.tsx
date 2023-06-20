// SolidJS
import { useAppState } from './AppState';
import { listen, Event, UnlistenFn, emit } from '@tauri-apps/api/event';
// Tauri
import { invoke } from '@tauri-apps/api/tauri';
import { createEffect, getOwner, onCleanup } from 'solid-js';
// API
import { Tab } from './types';
import { Relationship, Guild, Channel } from './discord';

//TODO: clean

interface GatewayEvent {
	user_id: string;
	type: string;
}
interface a<T> {
	eventName: string;
	listener: (event: T) => void;
}

const AppState = useAppState();
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
		console.log('getUserData', await res);
		return (await res).data;
	},
	async getRelationships(userId: string = AppState.userID() as string) {
		let res = oneTimeListener<{ type: string; user_id: string; data: any }>('general', 'relationships');
		await emit('getRelationships', { userId });
		console.log('getRelationships', await res);
		return (await res).data;
	},
	async getGuilds(userId: string = AppState.userID() as string) {
		console.log('getGuilds', userId);
		let res = oneTimeListener<{ type: string; user_id: string; data: any }>('general', 'guilds');
		await emit('getGuilds', { userId });
		let guilds = (await res).data.guilds as Guild[];
		console.log('getGuilds', guilds);
		return guilds;
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
	async getToken(userId: string = AppState.userID() as string) {
		return (await invoke('get_token', { userId })) as string | null;
	},

	async updateCurrentUserID() {
		let response = await invoke('get_last_user');
		AppState.setUserID(response as string);
		return;
	},

	snakeToCamel(str: string) {
		return str.replace(/(?!^)_(.)/g, (_, char) => char.toUpperCase());
	},

	toCamelCase(object: any) {
		let obj = Object.assign({}, object);
		let newObj: any = {};
		for (const key in obj) {
			const camelKey = this.snakeToCamel(key);
			if (Array.isArray(obj[key])) {
				newObj[camelKey] = [];
				for (const item of obj[key]) {
					if (item instanceof Object) {
						newObj[camelKey].push(this.toCamelCase(item));
					} else {
						newObj[camelKey].push(item);
					}
				}
			} else if (obj[key] instanceof Object) {
				newObj[camelKey] = this.toCamelCase(obj[key]);
			} else {
				newObj[camelKey] = obj[key];
			}
		}
		return newObj;
	},

	//oh mein gott, what retard wrote this????				(me, i am the retard)
	async updateGuilds() {
		AppState.setUserGuilds([]);
		let guilds: Guild[] = await this.getGuilds();

		AppState.setUserGuilds((prev: any) => guilds);
	},

	async updateRelationships() {
		AppState.setRelationships([]);
		let relationships: Relationship[] = (await this.getRelationships()).relationships;
		console.log(relationships);
		AppState.setRelationships((prev: any) => [...relationships]);
	},
	/**
	 * Represents a book.
	 * @param {string} channelId - Channel or user id.
	 * @param {string} guildId - if dms, pass \@me.
	 * @Gami
	 */
	async addTab(channel: Channel, fallback: void) {
		let guild = AppState.userGuilds().find((g: Guild) => g.properties.id === channel.guildId);

		if (!guild) {
			console.error('Guild not found!');
			return;
		}
		let tab: Tab = {
			guildId: channel.guildId,
			channelId: channel.id,
			channelName: channel.name,
			channelType: channel.type,
			guildIcon: guild.icon,
			guildName: guild.name,
		};

		AppState.setTabs((prev: any) => [...prev, tab]);
		console.log(AppState.tabs());
	},
	async replaceCurrentTab(channel: Channel, currentChannelId: string) {
		let currentTab = AppState.tabs().find((t: Tab) => t.channelId === currentChannelId);

		if (!currentTab) {
			console.error('Current tab not found!');
			console.log(AppState.tabs());
			console.log(currentChannelId);
			return;
		}
		let guild = AppState.userGuilds().find((g: Guild) => g.properties.id === channel.guildId);

		if (!guild) {
			console.error('Guild not found!');
			return;
		}
		let tab: Tab = {
			guildId: channel.guildId,
			channelId: channel.id,
			channelName: channel.name,
			channelType: channel.type,
			guildIcon: guild.icon,
			guildName: guild.name,
		};

		AppState.setTabs((prev: any) => {
			let newTabs = prev.filter((t: Tab) => t.channelId !== currentChannelId);
			return [...newTabs, tab];
		});
	},
};
