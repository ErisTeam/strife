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
import { Navigator } from '@solidjs/router';
import { Volume2 } from 'lucide-solid';
import { CONSTANTS } from './Constants';
import { Component } from 'solid-js';

export default {
	Voice: {
		async joinVoiceChannel(guildId: string, channelId: string) {
			//TODO: implement voice
		},
	},

	channelFromRelationship(relationship: Relationship): Channel {
		return {
			...relationship,
			id: relationship.user.id,
			name: relationship.user.username,
			type: CONSTANTS.GUILD_TEXT,
			guild_id: '@me',
		};
	},

	getChannelIcon(channel: Channel): { emoji: string | Component; newName: string } {
		//extract emoji from name
		const emojiReg = channel.name.match(/\p{Extended_Pictographic}/gu);

		let emoji: string | Component = '#';
		let newName = channel.name;
		if (emojiReg) {
			//remove emoji from name
			const regEx = new RegExp(emojiReg[0], 'g');
			newName = channel.name.replace(regEx, '');
			emoji = emojiReg[0];
		}
		console.log(channel.type);
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
		if (!userId) userId = AppState.userId();
		return await invoke('get_token', { userId });
	},

	async updateCurrentUserID() {
		const response = await invoke('get_last_user');
		const AppState = useAppState();
		AppState.setUserId(response as string);
		return;
	},

	snakeToCamel(str: string): string {
		return str.replace(/(?!^)_(.)/g, (_, char) => char.toUpperCase());
	},

	async updateGuilds() {
		const AppState = useAppState();
		AppState.setUserGuilds([]);

		const guilds: Guild[] = await this.getGuilds(AppState.userId());
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
		const relationships = await this.getRelationships(AppState.userId());
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
