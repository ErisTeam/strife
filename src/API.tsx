import { useAppState } from './AppState';
const AppState: any = useAppState();
import { GuildType } from './discord';

export default {
	async updateGuilds() {
		AppState.setUserGuilds([]);

		const url = 'https://discord.com/api/v9/users/@me/affinities/guilds';
		const response = await fetch(url, {
			method: 'GET',

			headers: {
				Authorization: `${AppState.userToken()}`,
			},
		});
		let resData = await response.json();
		let guildIds: string[] = [];
		console.log(resData);

		resData.guild_affinities.forEach((e: any) => {
			guildIds.push(e.guild_id);
		});

		guildIds.forEach(async (id) => {
			const url = `https://discord.com/api/v9/guilds/${id}?with_counts=true`;
			const response = await fetch(url, {
				method: 'GET',

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
			};

			AppState.setUserGuilds((prev: any) => [...prev, guild]);
			console.log(AppState.userGuilds());
		});
	},
};
