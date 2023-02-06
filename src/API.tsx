import { useAppState } from "./AppState";
const AppState: any = useAppState();
import { GuildType, ChannelType } from "./discord";
import { invoke } from "@tauri-apps/api/tauri";

export default {
	async getToken(user_id: string) {
		return (await invoke("get_token", { id: user_id })) as string | null;
	},
	async getCurrentUser() {
		const url = "https://discord.com/api/v9/users/@me";
		const response = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: `${AppState.userToken()}`,
			},
		});
		let resData = await response.json();
		console.log(resData);
		return resData;
	},
	async updateCurrentChannels(id: string) {
		AppState.setCurrentGuildChannels([] as ChannelType[]);

		const url = `https://discord.com/api/v9/guilds/${id}/channels`;
		const response = await fetch(url, {
			method: "GET",

			headers: {
				Authorization: `${AppState.userToken()}`,
			},
		});
		let resData = await response.json();

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
		AppState.setUserGuilds([]);

		const url = "https://discord.com/api/v9/users/@me/affinities/guilds";
		const response = await fetch(url, {
			method: "GET",

			headers: {
				Authorization: `${AppState.userToken()}`,
			},
		});
		let resData = await response.json();
		let guildIds: string[] = [];

		resData.guild_affinities.forEach((e: any) => {
			guildIds.push(e.guild_id);
		});

		guildIds.forEach(async (id) => {
			const url = `https://discord.com/api/v9/guilds/${id}?with_counts=true`;
			const response = await fetch(url, {
				method: "GET",

				headers: {
					Authorization: `${AppState.userToken()}`,
				},
			});
			let resData = await response.json();

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
};
