// SolidJS
import { useAppState } from './AppState';
import { listen, Event, UnlistenFn, emit } from '@tauri-apps/api/event';
// Tauri
import { invoke } from '@tauri-apps/api/tauri';
import { createEffect, getOwner, onCleanup } from 'solid-js';
// API
import { Tab } from './types';
import { Channel, Guild, Relationship } from './discord';
import { oneTimeListener } from './test';

const AppState = useAppState();

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

	//oh mein gott, what retard wrote this????				(me, i am the retard)      nvm fiex it
	//still a mess, but SHOULD result in better performance because i can run less loops on each channel list render
	//is reversed cause you for some reason cant append children to the last element in an array of elements
	async updateGuilds() {
		AppState.setUserGuilds([]);
		let guilds: Guild[] = await this.getGuilds();
		//TODO: pietruszka pls make rust return channel with the guild_id already filled in       thx 😘
		guilds.forEach((guild) => {
			guild.channels.forEach((channel) => {
				channel.guild_id = guild.properties.id;
			});
		});
		guilds.forEach((guild) => {
			let categories: any[] = guild.channels.filter((channel) => channel.type === 4);

			categories.forEach((category: any) => {
				category.children = guild.channels.filter((channel) => channel.parent_id == category.id);

				category.children.sort((a: any, b: any) => b.type - a.type || b.position - a.position);
			});

			let leftovers = guild.channels.filter((channel) => channel.type != 4 && !channel.parent_id);

			categories = categories.concat(leftovers);
			categories.sort((a: any, b: any) => a.type - b.type || a.position - b.position);
			let channelsFinal: Channel[] = [];
			categories.forEach((channel: any) => {
				if (channel.type != 4) {
					channelsFinal.push(channel);
				}
				if (channel.type == 4) {
					channelsFinal.push(channel);
					channel.children.forEach((child: any) => {
						channelsFinal.push(child);
					});
				}
			});
			guild.channels = channelsFinal.reverse();
			console.log('guild' + guild.properties.name, guild);
		});
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
		console.log('channel', channel);
		let guild = AppState.userGuilds().find((g: Guild) => g.properties.id == channel.guild_id);

		if (!guild) {
			console.error('Guild not found!');
			return;
		}
		let tab: Tab = {
			guildId: channel.guild_id,
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
		let guild = AppState.userGuilds().find((g: Guild) => g.properties.id === channel.guild_id);

		if (!guild) {
			console.error('Guild not found!');
			return;
		}
		let tab: Tab = {
			guildId: channel.guild_id,
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
