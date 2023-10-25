import { Role, snowflake } from "./utils";
import { channel, Channel } from "./Channel";

export type guild_affinities = { guild_id: string; affinity: number };
export type GuildsResponse = { guild_affinities: Array<guild_affinities> };

//TODO: copy form rust discord/type/guild PartialGuild
export type Guild = {
	description: string;
	splash: string;
	member_count: number;
	presence_count: number;
	features: string[];
	banner: string;

	roles: Role[];
	properties: {
		system_channel_id: string;
		id: string;
		name: string;
		owner_id: string;
		icon?: string;
	};

	channels: Channel[];
};


export interface GuildChannel extends channel {
	position?: number;
	parent_id?: snowflake;
	permission_overwrites?: any[];
	nsfw?: boolean;
}
