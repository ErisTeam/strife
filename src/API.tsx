// SolidJS
import { useAppState } from './AppState';

// Tauri
import { invoke } from '@tauri-apps/api/tauri';

// API
import { GuildType, ChannelType, Relationship } from './discord';

const AppState: any = useAppState();

export default {
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
	 * Sends a request to the Rust API to get the user's token
	 * @param user_id
	 */
	async getToken() {
		return (await invoke('get_token', { id: AppState.userID() })) as string | null;
	},

	/**
	 * Updates the AppState of `currentUser`
	 */
	async updateCurrentUserID() {
		let response = await invoke('get_last_user');
		AppState.setUserID(response);
		return;
	},

	/**
	 * Updates the AppState of `currentChannels`
	 */
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

	/**
	 * Updates the AppState of `guilds`
	 */
	async updateGuilds() {
		/* 		let userData = await invoke('get_user_data', { id: AppState.userID() });
		console.log(userData); */
		let token = await this.getToken();
		if (!token) {
			console.error("No user token found! Can't update guilds!");
			return;
		}

		AppState.setUserGuilds([]);

		const url = 'https://discord.com/api/v9/users/@me/affinities/guilds';
		const resDataponse = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: token,
			},
		});

		let resData = await resDataponse.json();

		let guildIds: string[] = [];

		resData.guild_affinities.forEach((e: any) => {
			guildIds.push(e.guild_id);
		});

		guildIds.forEach(async (id) => {
			const url = `https://discord.com/api/v9/guilds/${id}?with_counts=true`;
			const resDataponse = await fetch(url, {
				method: 'GET',
				headers: {
					Authorization: token as string,
				},
			});

			let resData = await resDataponse.json();

			let guild: GuildType = {
				id: resData.id,
				name: resData.name,
				icon: resData.icon,
				description: resData.description,
				splash: resData.splash,
				member_count: resData.approximate_member_count,
				presence_count: resData.approximate_presence_count,
				features: resData.features,
				banner: resData.banner,
				ownerId: resData.owner_id,
				roles: resData.roles,
				system_channel_id: resData.system_channel_id,
			};

			AppState.setUserGuilds((prev: any) => [...prev, guild]);
		});
	},

	/**
	 * Updates the AppState of `relationships`
	 */
	async updateRelationships() {
		let token = await this.getToken();
		if (!token) {
			console.error("No user token found! Can't update relationships!");
			return;
		}

		AppState.setRelationshpis([]);

		const url = 'https://discord.com/api/v9//users/@me/relationships';
		const resDataponse = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: token,
			},
		});

		const resData = await resDataponse.json();

		resData.forEach((e: any) => {
			const relationship: Relationship = {
				id: e.id,
				type: e.type,
				user: {
					avatar: e.user.avatar,
					avatar_decoration: e.user.avatar_decoration,
					discriminator: e.user.discriminator,
					display_name: e.user.display_name,
					id: e.user.id,
					public_flags: e.user.public_flags,
					username: e.user.username,
				},
			};

			AppState.setRelationshpis((prev: any) => [...prev, relationship]);
		});
	},
};
