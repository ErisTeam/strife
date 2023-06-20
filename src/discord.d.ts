type guild_affinities = { guild_id: string; affinity: number };
type GuildsResponse = { guild_affinities: Array<guild_affinities> };

type user_affinities = { user_id: string; affinity: number };
type UsersResponse = {
	inverse_user_affinities: [];
	user_affinities: Array<user_affinities>;
};

// Represents a Relationship User
type User = {
	id: string;
	username: string;
	avatar?: string;
	avatar_decoration?: string;
	discriminator: string;
	display_name?: string;
	public_flags: number;
};

declare enum RelationshipType {
	Friend = 1,
	Block = 2,
	IncomingFriendRequest = 3,
	OutgoingFriendRequest = 4,
}

/**
 * Relationship is a collection of all your contacts with other
 * users. It's represented by the `type` property.
 *
 * All possible `type` values and their meanings:
 * @example
 *	1 - friend
 *	2 - block
 *	3 - incoming friend request
 *	4 - outgoing friend request
 *
 */
type Relationship = {
	id: string;
	nickname?: string;
	type: RelationshipType;
	user: User;
};

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

//TODO: copy form rust discord/type/guild PartialGuild
type Guild = {
	icon: string | null;
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

type Channel = {
	id: string;
	type: ChannelType;
	guild_id: string | null;
	position: number | 0;
	permission_overwrites?: any[];
	name: string | null;
	topic?: string;
	nsfw?: boolean;
	last_message_id?: string;
	bitrate?: number;
	user_limit?: number;
	rate_limit_per_user?: number;
	recipients?: any[] /* replace with user objects when we create them */;
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
	available_tags?: any[] /* replace with tag objects */;
	applied_tags?: string[];
	default_reaction_emoji?: string /* replace with default reaction object */;
	default_thread_rate_limit_per_user?: number;
	default_sort_order?: number;
	default_forum_layout?: number;
};
type Sticker = {};

declare enum ChannelType {
	GuildText = 0,
	DM = 1,
	GuildVoice = 2,
	GroupDM = 3,
	GuildCategory = 4,
	GuildAnnouncement = 5,
	AnnouncementThread = 10,
	PublicThread = 11,
	PrivateThread = 12,
	GuildStageVoice = 13,
	GuildDirectory = 14,
	GuildForum = 15,
}

export type { GuildsResponse, UsersResponse, Role, Guild, Channel, User, Relationship, ChannelType };
