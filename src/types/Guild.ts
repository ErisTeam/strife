import { Role, snowflake } from './utils';
import { channel, Channel } from './Channel';
import { PublicUser, UserFlag as UserFlags } from './User';

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

export interface GuildMember {
	user?: PublicUser;
	nick?: string;
	avatar?: string;
	roles: string[];
	joined_at: string;
	premium_since?: string;
	deaf: boolean;
	mute: boolean;
	presence?: any;

	flags: UserFlags;
	pending: boolean;
	permissions?: string;
	comunication_disabled_until?: string;
}

export interface GuildChannel extends channel {
	position?: number;
	parent_id?: snowflake;
	permission_overwrites?: any[];
	nsfw?: boolean;
}

export interface GuildListGroup {
	name: string;
	type: 'Role' | 'Online' | 'Offline';
	data?: string;
	count: number;
	start_index: number;
}

export interface GuildListUpdate {
	online_count: number;
	member_count: number;
	guild_id: snowflake;
	groups: GuildListGroup[];
	recipients: GuildMember[];
}
