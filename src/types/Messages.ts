import { PublicUser } from './User';
import { Role } from './utils';
import { channel } from './Channel';
import { GuildMember } from './Guild';

//TODO: add the rest of fields https://discord.com/developers/docs/resources/channel#message-object
export type Message = {
	id: Required<string>;
	channel_id: string;

	author: PublicUser;
	member?: GuildMember;
	timestamp: number;
	content: string;

	mentions: Partial<any>[]; //TODO: add mentions
	mention_roles: Role[];
	mention_channels?: channel[];

	attachments: any[];
	embeds: any[];
	resolved?: any;
};

export type Embed = {
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
export type EmbedFooter = {
	text: string;
	icon_url?: string;
	proxy_icon_url?: string;
};

//https://discord.com/developers/docs/resources/channel#embed-object-embed-image-structure
export type EmbedImage = {
	url: string;
	proxy_url?: string;
	height?: number;
	width?: number;
};

//https://discord.com/developers/docs/resources/channel#embed-object-embed-thumbnail-structure
export type EmbedThumbnail = EmbedImage;

//https://discord.com/developers/docs/resources/channel#embed-object-embed-video-structure
export type EmbedVideo = EmbedImage;

//https://discord.com/developers/docs/resources/channel#embed-object-embed-provider-structure
export type EmbedProvider = {
	name?: string;
	url?: string;
};

//https://discord.com/developers/docs/resources/channel#embed-object-embed-author-structure
export type EmbedAuthor = {
	name: string;
	url?: string;
	icon_url?: string;
	proxy_icon_url?: string;
};

export type EmbedField = {
	name: string;
	value: string;
	inline?: boolean;
};

export type MessageReference = {
	message_id?: string;
	channel_id?: string;
	guild_id?: string;
	fail_if_not_exists?: boolean;
};
