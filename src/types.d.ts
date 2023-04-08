type InputType =
	| 'text'
	| 'number'
	| 'email'
	| 'password'
	| 'search'
	| 'hidden'
	| string;
type ButtonType = 'button' | 'submit' | 'reset';
type TextAreaType = 'soft' | 'hard' | 'off';

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
	avatarDecoration?: string;
	discriminator: string;
	displayName?: string;
	publicFlags: number;
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


type Tab ={
	guildId:string | null;
	channelId:string;
	guildIcon:string | null;
	channelName:string | null;
	guildName:string | null; // if it's a dm channel, this should be empty or undefined or null
	channelType:number;
}





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

//todo copy form rust discord/type/guild PartialGuild
type GuildType = {
	id: string;
	name: string;
	icon: string;
	description: string;
	splash: string;
	features: string[];
	banner: string;
	ownerId: string;
	roles: Role[];
	stickers: StickerType[];
	systemChannelId: string;
	channels: ChannelType[];
};
type StickerType = {
}
type ChannelType = {
	id: string;
	type: number;
	name: string;
	position: number | 0;
	guildId: string; // if it's a dm channel, this should be empty or undefined or null
	
	permissionOverwrites?: any[];

	topic?: string;
	nsfw?: boolean;
	lastMessageId?: string;
	bitrate?: number;
	userLimit?: number;
	rateLimitPerUser?: number;
	recipients?: any[] /* replace with user objects when we create them */;
	icon?: string;
	ownerId?: string;
	applicationId?: string;
	parentId?: string;
	lastPinTimestamp?: string;
	rtcRegion?: string;
	videoQualityMode?: number;
	messageCount?: number;
	memberCount?: number;
	threadMetadata?: object;
	member?: object;
	defaultAutoArchiveDuration?: number;
	permissions?: string;
	flags?: number;
	totalMessageSent?: number;
	availableTags?: any[] /* replace with tag objects */;
	appliedTags?: string[];
	defaultReactionEmoji?: string /* replace with default reaction object */;
	defaultThreadRateLimitPerUser?: number;
	defaultSortOrder?: number;
	defaultForumLayout?: number;
};

export type { InputType, ButtonType, TextAreaType, 	GuildsResponse,

	User,
	Relationship, Tab, 
	UsersResponse,
	Role,
	GuildType,
	ChannelType,


}; 
