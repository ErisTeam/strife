import { Channel } from '@/types/Channel';
import { Relationship } from '@/types/User';
import { CONSTANTS } from '@/Constants';
import { useAppState } from '@/AppState';
import { Guild } from '@/types/Guild';
import { oneTimeListener } from '@/test';
import { emit } from '@tauri-apps/api/event';
export function getGuildIconFromChannel(channel: Channel): string {
	const AppState = useAppState();
	const guild = AppState.userGuilds.find((g) => g.properties.id === channel.guild_id);
	return guild.properties.icon;
}
export async function getGuilds(userId: string) {
	const res = oneTimeListener<{ type: string; user_id: string; data: { guilds: Guild[] } }>('general', 'guilds');
	await emit('getGuilds', { userId });

	return (await res).data.guilds;
}
export async function updateGuilds() {
	const AppState = useAppState();
	AppState.setUserGuilds([]);

	const guilds: Guild[] = await getGuilds(AppState.userId);
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
}
