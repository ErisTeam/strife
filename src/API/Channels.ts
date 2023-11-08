import { Channel } from '@/types/Channel';
import { useAppState } from '@/AppState';
import { Relationship } from '@/types/User';
import { CONSTANTS } from '@/Constants';
import { Volume2 } from 'lucide-solid';
import { Component } from 'solid-js';
import { getToken } from './User';
export function channelFromRelationship(relationship: Relationship): Channel {
	return {
		...relationship,
		id: relationship.user.id,
		name: relationship.user.username,
		type: CONSTANTS.GUILD_TEXT,
		guild_id: '@me',
		position: 0,
	};
}
export function getChannelIcon(channel: Channel): { emoji: string | Component; newName: string } {
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
}
export function getChannelById(guildId: string, channelId: string): Channel | undefined {
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
}
export function addAdditionalChannelDataToState(channelId: string) {
	const AppState = useAppState();
	getToken().then((token) => {
		if (!token) {
			console.error("No user token found! Can't get messages!");
			return;
		}
		const url = `${CONSTANTS.API_URL}/${CONSTANTS.CHANNEL_API_URL}/${channelId}`;
		const resDataponse = fetch(url, {
			method: 'GET',
			headers: {
				Authorization: token,
			},
		}).then((res) =>
			res.json().then((data) => {
				console.log('addAdditionalChannelDataToState', data);
				AppState.setOpenedChannelsAdditionalData(data.id, data);
				console.log('addAdditionalChannelDataToState', AppState.openedChannelsAdditionalData);
			}),
		);
	});
}
