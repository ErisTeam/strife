import { snowflake } from "./utils";

//TODO: add the rest of channel types
export interface channel {
	id: snowflake;
	type: ChannelType;
	guild_id?: snowflake;
	name: string;
}

export interface GroupDmChannel extends channel {
	type: ChannelType.GroupDM;
	guild_id: '@me';
	recipients?: any[];
	icon?: string;
	owner_id: snowflake;
	application_id?: snowflake;
	managed?: boolean;
}

export type Channel = {
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
