import type { Channel } from "@/types/Channel";
import type { AppStateType } from "@/AppState";
import type { Relationship } from "@/types/User";
import { CONSTANTS } from "@/Constants";

export function channelFromRelationship(relationship: Relationship): Channel {
	return {
		...relationship,
		id: relationship.user.id,
		name: relationship.user.username,
		type: CONSTANTS.GUILD_TEXT,
		guild_id: "@me",
		position: 0,
	};
}
export function getChannelIcon(channel: Channel): {
	emoji: string | Element;
	newName: string;
} {
	//extract emoji from name
	const emojiReg = channel.name.match(/\p{Extended_Pictographic}/gu);

	let emoji: string | Element = "#";
	let newName = channel.name;

	if (emojiReg != null) {
		//remove emoji from name
		emoji = emojiReg[0];
		const regEx = new RegExp(emojiReg[0], "g");
		newName = channel.name.replace(regEx, "");
	} else {
		switch (channel.type) {
			case CONSTANTS.GUILD_TEXT:
				emoji = "#";
				break;
			case CONSTANTS.GUILD_VOICE:
				emoji = "🔊";
				break;
			case CONSTANTS.GUILD_CATEGORY:
				emoji = "📁";
				break;
			case CONSTANTS.GUILD_ANNOUNCEMENT:
				emoji = "📢";
				break;
			case CONSTANTS.GUILD_DIRECTORY:
				emoji = "📁";
				break;
			case CONSTANTS.GUILD_FORUM:
				emoji = "📰";
				break;
			case CONSTANTS.GUILD_STAGE_VOICE:
				emoji = "🎤";
				break;
			default:
				emoji = "❓";
		}
	}
	return { emoji, newName };
}
export function getChannelById(AppState: AppStateType, guildId: string, channelId: string): Channel | undefined {
	const guild = AppState.userGuilds.find((g) => g.properties.id === guildId);
	if (!guild) {
		console.error("Guild not found!");
		return;
	}
	const channel = guild.channels.find((c) => c.id === channelId);
	if (!channel) {
		console.error("Channel not found!");
		return;
	}

	return channel;
}
