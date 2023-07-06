// SolidJS
import { useAppState } from './AppState';
import { emit } from '@tauri-apps/api/event';
// Tauri
import { invoke } from '@tauri-apps/api/tauri';
// API
import { Tab } from './types';
import { Channel, Guild, Relationship } from './discord';
import { oneTimeListener } from './test';
import { produce } from 'solid-js/store';
import { Navigator, useNavigate } from '@solidjs/router';
import { Owner, runWithOwner } from 'solid-js';

const AppState = useAppState();

export default {
	Tabs: {
		openTab(tab: Tab, navigator: Navigator) {
			navigator(`/app/${tab.guildId}/${tab.channelId}`);
		},
		addNewTab(channel: Channel, navigator?: Navigator): [number, Tab?] {
			let t = AppState.tabs.find((tab) => tab.channelId == channel.id);
			if (t) {
				console.log('tab already exists');
				return [1, t];
			}

			console.log('channel', channel);
			const guild = AppState.userGuilds.find((g: Guild) => g.properties.id == channel.guild_id);

			if (!guild) {
				console.error('Guild not found!');
				return [2];
			}
			const tab: Tab = {
				guildId: channel.guild_id,
				channelId: channel.id,
				channelName: channel.name,
				channelType: channel.type,
				guildIcon: guild.properties.icon,
				guildName: guild.properties.name,
			};

			AppState.setTabs(produce((tabs) => tabs.push(tab)));
			console.log(AppState.tabs);
			if (navigator) {
				this.openTab(tab, navigator);
			}
			return [0, tab];
		},
	},

	async activateUser(userId: string = AppState.userId()) {
		return await invoke('activate_user', { userId });
	},

	//TODO: Handle awaiting in wrapper functions not here
	async getUserData(userId: string) {
		const res = oneTimeListener<{ type: string; user_id: string; data: any }>('general', 'userData');
		await emit('getUserData', { userId });
		console.log('getUserData', await res);
		return (await res).data;
	},
	async getRelationships(userId: string = AppState.userId()) {
		const res = oneTimeListener<{ type: string; user_id: string; data: any }>('general', 'relationships');
		await emit('getRelationships', { userId });
		console.log('getRelationships', await res);
		return (await res).data;
	},
	async getGuilds(userId: string = AppState.userId()) {
		console.log('getGuilds', userId);
		const res = oneTimeListener<{ type: string; user_id: string; data: any }>('general', 'guilds');
		await emit('getGuilds', { userId });
		const guilds = (await res).data.guilds as Guild[];
		return guilds;
	},

	/**
	 * Get messages of the given channel.
	 * @param channelId
	 * @returns
	 */
	async getMessages(channelId: string) {
		const token = await this.getToken();
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

		const resData = await resDataponse.json();

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
		const token = await this.getToken();
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

		const resData = await resDataponse.json();

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
		const token = await this.getToken();
		if (!token) {
			console.error("No user token found! Can't edit message!");
			return;
		}
		const res = await fetch('https://discord.com/api/v9/channels/' + channelId + '/messages/' + messageId, {
			method: 'PATCH',
			headers: {
				Authorization: token,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				content: content,
			}),
		});
		const resData = await res.json();
		return resData;
	},

	/**
	 * Sends a request to the Rust API to get the user's token
	 * @param user_id
	 */
	async getToken(userId: string = AppState.userId() as string) {
		return await invoke('get_token', { userId });
	},

	async updateCurrentUserID() {
		const response = await invoke('get_last_user');
		AppState.setUserID(response as string);
		return;
	},

	snakeToCamel(str: string): string {
		return str.replace(/(?!^)_(.)/g, (_, char) => char.toUpperCase());
	},

	toCamelCase(object: any) {
		const obj = Object.assign({}, object);
		const newObj: any = {};
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

	async updateGuilds() {
		AppState.setUserGuilds([]);

		await this.activateUser();

		const guilds: Guild[] = await this.getGuilds();
		//TODO: pietruszka pls make rust return channel with the guild_id already filled in       thx 😘
		guilds.forEach((guild) => {
			guild.channels.forEach((channel) => {
				channel.guild_id = guild.properties.id;
			});
		});
		type ChannelWithChildren = Channel & { children?: Channel[] };

		guilds.forEach((guild) => {
			const categories: ChannelWithChildren[] = guild.channels.filter((channel) => !channel.parent_id);
			categories.forEach((category: ChannelWithChildren) => {
				category.children = guild.channels.filter((channel) => channel.parent_id == category.id);

				category.children.sort((a: Channel, b: Channel) => b.type - a.type || b.position - a.position);
			});

			categories.sort((a: ChannelWithChildren, b: ChannelWithChildren) => a.type - b.type || a.position - b.position);
			guild.channels = [];
			categories.forEach((channel: ChannelWithChildren) => {
				guild.channels.push(channel);
				if (channel.children) {
					guild.channels = guild.channels.concat(channel.children);
				}
			});

			console.log('guild' + guild.properties.name, guild);
			if (guild.properties.icon) {
				guild.properties.icon = `https://cdn.discordapp.com/icons/${guild.properties.id}/${guild.properties.icon}.webp?size=96`;
			}
		});
		console.log(guilds);
		AppState.setUserGuilds(guilds);
	},

	async updateRelationships() {
		AppState.setRelationships([]);
		const relationships: Relationship[] = (await this.getRelationships()).relationships;
		console.log(relationships);
		AppState.setRelationships(relationships);
	},

	addTab(channel: Channel) {
		if (AppState.tabs.find((tab) => tab.channelId == channel.id)) {
			console.log('tab already exists');
			return;
		}

		console.log('channel', channel);
		const guild = AppState.userGuilds.find((g: Guild) => g.properties.id == channel.guild_id);

		if (!guild) {
			console.error('Guild not found!');
			return;
		}
		const tab: Tab = {
			guildId: channel.guild_id,
			channelId: channel.id,
			channelName: channel.name,
			channelType: channel.type,
			guildIcon: guild.properties.icon,
			guildName: guild.properties.name,
		};

		AppState.setTabs((prev) => [...prev, tab]);
		console.log(AppState.tabs);
	},
	removeTab(tabIndex: number) {
		console.log('removing tab', tabIndex);
		AppState.setTabs(produce((draft) => draft.splice(tabIndex, 1)));
	},

	replaceCurrentTab(channel: Channel, currentChannelId: string) {
		const currentTabIndex = AppState.tabs.findIndex((t: Tab) => t.channelId === currentChannelId);

		if (!(currentTabIndex + 1)) {
			console.error('Current tab not found!');
			console.log(AppState.tabs);
			console.log(currentChannelId);
			return;
		}
		const guild = AppState.userGuilds.find((g: Guild) => g.properties.id === channel.guild_id);

		if (!guild) {
			console.error('Guild not found!');
			return;
		}
		const tab: Tab = {
			guildId: channel.guild_id,
			channelId: channel.id,
			channelName: channel.name,
			channelType: channel.type,
			guildIcon: guild.properties.icon,
			guildName: guild.properties.name,
		};

		console.warn('replacing tab with index', currentTabIndex, 'with');
		AppState.setTabs(currentTabIndex, tab);
	},
	getInitials(input: string): string {
		const words = input.split(' ');
		let initials = '';
		if (words.length > 1) {
			words.forEach((word) => {
				initials += word[0];
			});
		} else {
			initials = input[0];
		}

		return initials;
	},
};
