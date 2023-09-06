// SolidJS
import { useAppState } from './AppState';
import { emit } from '@tauri-apps/api/event';
// Tauri
import { invoke } from '@tauri-apps/api/tauri';
// API
import { Tab, TabsFile } from './types';
import { Channel, Guild, Message, Relationship } from './discord';
import { oneTimeListener } from './test';
import { produce } from 'solid-js/store';
import { Volume2 } from 'lucide-solid';

import { CONSTANTS } from './Constants';
import { Component, batch } from 'solid-js';
import { exists, BaseDirectory, createDir, writeFile, readDir, readTextFile } from '@tauri-apps/api/fs';
const sessionDataPath = 'session_data';
const tabsPath = sessionDataPath + '/tabs.json';

export default {
	Voice: {
		async joinVoiceChannel(guildId: string, channelId: string) {
			//TODO: implement voice
		},
	},
	Tabs: {
		//! NOT working
		swapOrderByIdx(idx1: number, idx2: number) {
			const AppState = useAppState();
			console.log(AppState.tabsOrder());
			AppState.setTabsOrder((prev) => {
				const temp = prev[idx1];
				prev[idx1] = prev[idx2];
				prev[idx2] = temp;
				return prev;
			});
			console.log(AppState.tabsOrder());
			this.saveToFile().catch((err) => console.error(err));
		},
		setAsCurrent(tab: Tab | number) {
			const AppState = useAppState();
			if (typeof tab != 'number') {
				const index = AppState.tabs.indexOf(tab);
				if (index === -1) {
					console.error(`Tab not found`, tab);
					return;
				}
				AppState.setCurrentTabIndex(index);
			} else {
				AppState.setCurrentTabIndex(tab);
			}
			this.saveToFile().catch((err) => console.error(err));
		},

		remove(tab: Tab | number) {
			const AppState = useAppState();

			const tabIndex = typeof tab == 'number' ? tab : AppState.tabs.indexOf(tab);
			if (tabIndex === -1) {
				console.error(`Tab ${tab} not found`);
				return;
			}

			if (tabIndex == AppState.currentTabIndex()) {
				if (AppState.tabs.length > 1) {
					console.log('tabIndex', tabIndex, [...AppState.tabsOrder()]);
					let newTabindex = AppState.tabsOrder()[AppState.tabsOrder().indexOf(tabIndex) - 1];
					if (newTabindex == null) {
						newTabindex = 0;
					}
					AppState.setCurrentTabIndex(newTabindex);
				} else {
					AppState.setCurrentTabIndex(0);
				}
			} else if (AppState.currentTabIndex() > tabIndex) {
				AppState.setCurrentTabIndex(AppState.currentTabIndex() - 1);
			} else if (AppState.tabs.length === 1) {
				AppState.setCurrentTabIndex(-1);
			}
			//? batch is important here, otherwise tabs might not be updated correctly
			batch(() => {
				AppState.setTabs(produce((tabs) => tabs.splice(tabIndex, 1)));
				AppState.setTabsOrder((prev) => {
					const idx = prev.indexOf(tabIndex);
					prev.splice(idx, 1);

					prev = prev.map((order, index) => {
						if (order > tabIndex) {
							return order - 1;
						}
						return order;
					});
					return prev;
				});
			});
			this.saveToFile().catch((err) => console.error(err));
		},
		add(tab: Tab, replaceCurrent: boolean = false) {
			const AppState = useAppState();

			if (!replaceCurrent || AppState.tabs.length === 0) {
				AppState.setTabsOrder((prev) => [...prev, AppState.tabs.length]);
				AppState.setTabs(AppState.tabs.length, tab);
				if (replaceCurrent) AppState.setCurrentTabIndex(0);
				return;
			}
			//? batch is important here, otherwise tabs might not be updated correctly
			batch(() => {
				let tabIndex = AppState.currentTabIndex();
				if (tabIndex === -1) {
					tabIndex = AppState.tabs.length;
				}

				if (AppState.tabs[tabIndex].component != tab.component) {
					AppState.setTabs(tabIndex, tab);
					return;
				}

				batch(() => {
					AppState.setTabs(produce((tabs) => tabs.splice(tabIndex, 1)));
					AppState.setTabs(AppState.tabs.length, tab);
					const newTabIndex = AppState.tabs.length - 1;
					AppState.setCurrentTabIndex(newTabIndex);
					AppState.setTabsOrder((prev) => {
						const originalTabOrder = prev.indexOf(tabIndex);
						prev[originalTabOrder] = newTabIndex;
						for (let i = originalTabOrder + 1; i < prev.length; i++) {
							prev[i]--;
						}

						return prev;
					});
				});
				AppState.setCurrentTabIndex(tabIndex);
			});
			this.saveToFile().catch((err) => console.error(err));
		},

		async saveToFile() {
			const dir = BaseDirectory.AppData;
			const AppState = useAppState();
			// const filePath = this;
			const doesDirExist = await exists(sessionDataPath, { dir: dir });
			if (!doesDirExist) {
				await createDir(sessionDataPath, { dir: dir });
			}
			const tabsFile: TabsFile = {
				order: AppState.tabsOrder(),
				current: AppState.currentTabIndex(),
				tabs: AppState.tabs,
			};

			await writeFile(tabsPath, JSON.stringify(tabsFile), { dir: dir });
		},
		async loadFromFile(): Promise<boolean> {
			const AppState = useAppState();
			const dir = BaseDirectory.AppData;
			const doesDirExist = await exists(sessionDataPath, { dir: dir });
			if (!doesDirExist) {
				console.warn('No session data folder found');
				return false;
			}
			const doesFileExist = await exists(tabsPath, { dir: dir });
			if (!doesFileExist) {
				console.warn('No session data tabs file found');
				return false;
			}

			const tabsFile = JSON.parse(await readTextFile(tabsPath, { dir: dir })) as TabsFile;

			const tabsOrder = tabsFile.order;
			const currentTab = tabsFile.current;
			const tabs = tabsFile.tabs;

			console.log(tabsFile);

			AppState.setTabs(tabs);
			AppState.setTabsOrder(tabsOrder);
			AppState.setCurrentTabIndex(currentTab);
			return true;
		},
	},
	channelFromRelationship(relationship: Relationship): Channel {
		return {
			...relationship,
			id: relationship.user.id,
			name: relationship.user.username,
			type: CONSTANTS.GUILD_TEXT,
			guild_id: '@me',
			position: 0,
		};
	},
	getServerIconFromChannel(channel: Channel): string {
		const AppState = useAppState();
		const guild = AppState.userGuilds.find((g) => g.properties.id === channel.guild_id);
		return guild.properties.icon;
	},

	getChannelIcon(channel: Channel): { emoji: string | Component; newName: string } {
		//extract emoji from name
		const emojiReg = channel.name.match(/\p{Extended_Pictographic}/gu);

		let emoji: string | Component = '#';
		let newName = channel.name;

		if (emojiReg != null) {
			//remove emoji from name
			emoji = emojiReg[0];
			const regEx = new RegExp(emojiReg[0], 'g');
			newName = channel.name.replace(regEx, '');
		} else {
			switch (channel.type) {
				case CONSTANTS.GUILD_TEXT:
					emoji = '#';
					break;
				case CONSTANTS.GUILD_VOICE:
					emoji = Volume2;
					break;
				case CONSTANTS.GUILD_CATEGORY:
					emoji = '📁';
					break;
				case CONSTANTS.GUILD_ANNOUNCEMENT:
					emoji = '📢';
					break;
				case CONSTANTS.GUILD_DIRECTORY:
					emoji = '📁';
					break;
				case CONSTANTS.GUILD_FORUM:
					emoji = '📰';
					break;
				case CONSTANTS.GUILD_STAGE_VOICE:
					emoji = '🎤';
					break;
				default:
					emoji = '❓';
			}
		}
		return { emoji, newName };
	},

	async activateUser(userId: string) {
		console.log('activating user', userId);
		return await invoke('activate_user', { userId });
	},
	async getRelationships(userId: string) {
		const res = oneTimeListener<{ type: string; user_id: string; data: { relationships: Relationship[] } }>(
			'general',
			'relationships',
		);
		console.log("getting user's relationships");
		await emit('getRelationships', { userId });
		console.log('getRelationships', await res);
		return (await res).data.relationships;
	},
	async getGuilds(userId: string) {
		const res = oneTimeListener<{ type: string; user_id: string; data: { guilds: Guild[] } }>('general', 'guilds');
		await emit('getGuilds', { userId });

		return (await res).data.guilds;
	},

	async getLocalUserInfo(userId: string) {
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
	async getToken(userId: string = ''): Promise<string | null> {
		const AppState = useAppState();
		if (!userId) userId = AppState.userId;
		return await invoke('get_token', { userId });
	},

	async updateCurrentUserID() {
		const response = await invoke('get_last_user');
		const AppState = useAppState();

		AppState.userId = response as string;
		return;
	},

	snakeToCamel(str: string): string {
		return str.replace(/(?!^)_(.)/g, (_, char) => char.toUpperCase());
	},

	async updateGuilds() {
		const AppState = useAppState();
		AppState.setUserGuilds([]);

		const guilds: Guild[] = await this.getGuilds(AppState.userId);
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
		const AppState = useAppState();
		AppState.setRelationships([]);
		console.warn('updating relationships');
		const relationships = await this.getRelationships(AppState.userId);
		console.log(relationships);
		AppState.setRelationships(relationships);
	},
	getInitials(input: string): string {
		return input
			.split(' ')
			.map((w) => w[0])
			.join('');
	},
	getChannelById(guildId: string, channelId: string): Channel | undefined {
		const AppState = useAppState();
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
