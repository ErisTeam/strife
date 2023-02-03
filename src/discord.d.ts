type guild_affinities = { guild_id: string; affinity: number };
type GuildsResponse = { guild_affinities: Array<guild_affinities> };

type user_affinities = { user_id: string; affinity: number };
type UsersResponse = { inverse_user_affinities: []; user_affinities: Array<user_affinities> };
type Role = {
	id: string;
	name: string;
	permissions: string;
	position: number;
	color: number;
	hoist: boolean;
	managed: boolean;
	mentionable: boolean;
};
type GuildType = {
	id: string;
	name: string;
	icon: string;
	description: string;
	splash: string;
	member_count: number;
	presence_count: number;
	features: string[];
	banner: string;
	ownerId: string;
	roles: Role[];
	system_channel_id: string;
};
type ChannelType = {
id : string;
type: number;
guild_id?: string;
position: number | 0;
permission_overwrites?: any[];
name?: string;
topic?: string;
nsfw?: boolean;
last_message_id?: string;
bitrate?: number;
user_limit?: number;
rate_limit_per_user?: number;
recipients?: any[];/* replace with user objects when we create them */
icon?: string;
owner_id?: string;
application_id?: string;
parent_id?: string;
last_pin_timestamp?: string;
rtc_region?: string;
video_quality_mode?: number;
message_count?: number;
member_count?: number;
thread_metadata?: object;
member?: object;
default_auto_archive_duration?: number;
permissions?: string;
flags?: number;
total_message_sent?: number;
available_tags?: any[];/* replace with tag objects */
applied_tags?: string[];
default_reaction_emoji?: string; /* replace with default reaction object */
default_thread_rate_limit_per_user?: number;
default_sort_order?: number;
default_forum_layout?: number;
};
export type { GuildsResponse, UsersResponse, Role, GuildType, ChannelType };
