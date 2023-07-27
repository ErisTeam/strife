// SolidJS
import { useAppState } from './AppState';
import { emit } from '@tauri-apps/api/event';
// Tauri
import { invoke } from '@tauri-apps/api/tauri';
// API
import { Tab } from './types';
import { Channel, Guild, Message, Relationship } from './discord';
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
			const t = AppState.tabs.find((tab) => tab.channelId == channel.id);
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
		console.log('activating user', userId);
		return await invoke('activate_user', { userId });
	},
	async getRelationships(userId: string = AppState.userId()) {
		const res = oneTimeListener<{ type: string; user_id: string; data: { relationships: Relationship[] } }>(
			'general',
			'relationships',
		);
		console.log("getting user's relationships");
		await emit('getRelationships', { userId });
		console.log('getRelationships', await res);
		return (await res).data.relationships;
	},
	async getGuilds(userId: string = AppState.userId()) {
		const res = oneTimeListener<{ type: string; user_id: string; data: { guilds: Guild[] } }>('general', 'guilds');
		await emit('getGuilds', { userId });

		return (await res).data.guilds;
	},

	async getUserInfo(userId: string = AppState.userId()) {
		return (await invoke('get_user_info', { userId })) as any;
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

		const resData = (await resDataponse.json()) as Message[];

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
	async getToken(userId: string = AppState.userId()): Promise<string | null> {
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

			if (guild.properties.icon) {
				guild.properties.icon = `https://cdn.discordapp.com/icons/${guild.properties.id}/${guild.properties.icon}.webp?size=96`;
			}
		});
		console.log(guilds);
		AppState.setUserGuilds(guilds);
	},

	async updateRelationships() {
		AppState.setRelationships([]);
		console.warn('updating relationships');
		const relationships = await this.getRelationships();
		console.log(relationships);
		AppState.setRelationships(relationships);
	},

	addTab(tab: Tab) {
		if (AppState.tabs.find((t) => t.channelId == tab.channelId)) {
			console.error('tab already exists');
			return;
		}

		AppState.setTabs([...AppState.tabs, tab]);
		console.log(AppState.tabs);
	},
	removeTab(tabIndex: number) {
		console.log('removing tab', tabIndex);
		AppState.setTabs(produce((draft) => draft.splice(tabIndex, 1)));
	},

	replaceCurrentTab(tab: Tab, currentChannelId: string) {
		const currentTabIndex = AppState.tabs.findIndex((t: Tab) => t.channelId === currentChannelId);

		if (!(currentTabIndex + 1)) {
			console.error('Current tab not found!');
			console.log(AppState.tabs);
			console.log(currentChannelId);
			return;
		}

		console.warn('replacing tab with index', currentTabIndex, 'with');
		AppState.setTabs(currentTabIndex, tab);
	},
	getInitials(input: string): string {
		return input
			.split(' ')
			.map((w) => w[0])
			.join('');
	},
	getChannelById(guildId: string, channelId: string): Channel | undefined {
		const guild = AppState.userGuilds.find((g) => g.properties.id === guildId);
		if (!guild) {
			console.error('Guild not found!');
			return;
		}
		const channel = guild.channels.find((c) => c.id === channelId);
		if (!channel) {
			console.error('Channel not found!');
			return;
		}

		return channel;
	},
};
