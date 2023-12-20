import { Channel } from '@/types/Channel';
import { Relationship } from '@/types/User';
import { CONSTANTS } from '@/Constants';
import { useAppState } from '@/AppState';
import { Guild } from '@/types/Guild';
import { oneTimeListener } from '@/test';
import { emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';
import { snowflake } from '@/types/utils';
import murmurhash from 'murmurhash';
import { produce } from 'solid-js/store';
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

	const guilds: Guild[] = await getGuilds(AppState.userId());
	console.log('guilds', guilds);
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
export async function requestLazyGuilds(userId: string, guildId: string, channels?: snowflake[]) {
	await invoke('request_channels_recipients', {
		guildId,
		userId,
		channels,
	});
}
export function addAdditionalGuildDataToState(data: any) {
	const AppState = useAppState();

	if (!AppState.openedGuildsAdditionalData[data.guild_id]) {
		AppState.setOpenedGuildsAdditionalData(data.guild_id, {});
	}
	AppState.setOpenedGuildsAdditionalData(
		data.guild_id,
		produce((a) => {
			console.log('recipients data', data);
			a[data.list_id] = data;
		}),
	);
	console.log('Added additional data to state', AppState.openedGuildsAdditionalData);
}

function murumurhash3(key: string, seed: number = 0) {
	let remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

	remainder = key.length & 3; // key.length % 4
	bytes = key.length - remainder;
	h1 = seed;
	c1 = 0xcc9e2d51;
	c2 = 0x1b873593;
	i = 0;

	while (i < bytes) {
		console.log('i', i, bytes);
		k1 =
			(key.charCodeAt(i) & 0xff) |
			((key.charCodeAt(++i) & 0xff) << 8) |
			((key.charCodeAt(++i) & 0xff) << 16) |
			((key.charCodeAt(++i) & 0xff) << 24);
		++i;

		k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
		k1 = (k1 << 15) | (k1 >>> 17);
		k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

		h1 ^= k1;
		h1 = (h1 << 13) | (h1 >>> 19);
		h1b = ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
		h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
	}

	k1 = 0;

	switch (remainder) {
		case 3:
			k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
		case 2:
			k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
		case 1:
			k1 ^= key.charCodeAt(i) & 0xff;

			k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
			k1 = (k1 << 15) | (k1 >>> 17);
			k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
			h1 ^= k1;
	}

	h1 ^= key.length;

	h1 ^= h1 >>> 16;
	h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
	h1 ^= h1 >>> 13;
	h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff;
	h1 ^= h1 >>> 16;

	return h1 >>> 0;
}

// Source: https://luna.gitlab.io/discord-unofficial-docs/lazy_guilds.html#list-ids
export function getListIdForChannel(channel: Channel) {
	console.log(channel);
	let HashIn = [];
	for (let i = 0; i < channel.permission_overwrites.length; i++) {
		const permission = channel.permission_overwrites[i];

		let allow = BigInt(permission.allow);
		let deny = BigInt(permission.deny);
		if ((allow & (1n << 10n)) == 1024n) {
			HashIn.push(`allow:${permission.id}`);
		} else if ((deny & (1n << 10n)) == 1024n) {
			HashIn.push(`deny:${permission.id}`);
		}
	}
	let hashOut = murumurhash3(HashIn.join(','), 0);
	console.log('hashOut', hashOut, channel, HashIn, murumurhash3('foo'));
	if (hashOut == 0) {
		return 'everyone';
	}
	return hashOut.toString();
}
