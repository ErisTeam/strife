type guild_affinities = { guild_id: string; affinity: number };
type GuildsResponse = { guild_affinities: Array<guild_affinities> };

type user_affinities = { user_id: string; affinity: number };
type UsersResponse = {
	inverse_user_affinities: [];
	user_affinities: Array<user_affinities>;
};

// Represents a Relationship User
type RelationshipUser = {
	id: string;
	username: string;
	avatar?: string;
	avatar_decoration?: string;
	discriminator: string;
	global_name?: string;
	public_flags: number;
};

enum RelationshipType {
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
	user: RelationshipUser;
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

type snowflake = string;

//TODO: add the rest of channel types
interface channel {
	id: snowflake;
	type: ChannelType;
	guild_id?: snowflake;
	name: string;
}

interface GroupDmChannel extends channel {
	type: ChannelType.GroupDM;
	guild_id: '@me';
	recipients?: any[];
	icon?: string;
	owner_id: snowflake;
	application_id?: snowflake;
	managed?: boolean;
}

interface GuildChannel extends channel {
	position?: number;
	parent_id?: snowflake;
	permission_overwrites?: any[];
	nsfw?: boolean;
}

type Channel = {
	id: string;
	type: ChannelType;
	guild_id: string; // if it's a dm channel, set to @me
	position: number;
	permission_overwrites?: any[];
	name: string; //or user name if it's a dm channel
	topic?: string;
	nsfw?: boolean;
	last_message_id?: string;
	bitrate?: number;
	user_limit?: number;
	rate_limit_per_user?: number;
	recipients?: any[] /* replace with user objects when we create them */;
	icon?: string; //provide full address to icon
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

export enum ChannelType {
	GuildText = 0,
	DirectMessage = 1,
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

//TODO: add the rest of fields https://discord.com/developers/docs/resources/channel#message-object
type Message = {
	id: Required<string>;
	channel_id: string;

	content: string;

	timestamp: number;

	embeds: any[];

	author: Partial<any>; //TODO: add user type

	mentions: Partial<any>[];

	mention_roles: Role[];

	mention_channels?: channel[];

	attachments: any[];
};

type Embed = {
	title?: string;
	type?: string;
	description?: string;
	url?: string;

	timestamp?: string;

	color?: number;

	footer?: EmbedFooter;
	image?: EmbedImage;
	thumbnail?: EmbedThumbnail;
	video?: EmbedVideo;
	provider?: EmbedProvider;
	author?: EmbedAuthor;
	fields?: EmbedField[];
};
//https://discord.com/developers/docs/resources/channel#embed-object-embed-footer-structure
type EmbedFooter = {
	text: string;
	icon_url?: string;
	proxy_icon_url?: string;
};
//https://discord.com/developers/docs/resources/channel#embed-object-embed-image-structure
type EmbedImage = {
	url: string;
	proxy_url?: string;
	height?: number;
	width?: number;
};
//https://discord.com/developers/docs/resources/channel#embed-object-embed-thumbnail-structure
type EmbedThumbnail = EmbedImage;
//https://discord.com/developers/docs/resources/channel#embed-object-embed-video-structure
type EmbedVideo = EmbedImage;
//https://discord.com/developers/docs/resources/channel#embed-object-embed-provider-structure
type EmbedProvider = {
	name?: string;
	url?: string;
};
//https://discord.com/developers/docs/resources/channel#embed-object-embed-author-structure
type EmbedAuthor = {
	name: string;
	url?: string;
	icon_url?: string;
	proxy_icon_url?: string;
};
type EmbedField = {
	name: string;
	value: string;
	inline?: boolean;
};

export type { GuildsResponse, UsersResponse, Role, Guild, Channel, RelationshipUser, Relationship, Message, Embed };
