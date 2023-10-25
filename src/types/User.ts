import { snowflake } from "./utils";

export type user_affinities = { user_id: string; affinity: number };
export type UsersResponse = {
	inverse_user_affinities: [];
	user_affinities: Array<user_affinities>;
};

export type UserFlag = number;

export enum PublicUserFlags {
    /** Discord Employee. */
    staff = 1 << 0,

    /** Partnered Server Owner. */
    partner = 1 << 1,

    /** HypeSquad Events Member. */
    hypesquad = 1 << 2,

    /** Bug Hunter Level 1. */
    bug_hunter_level_1 = 1 << 3,

    /** House Bravery Member. */
    hypesquad_online_house_1 = 1 << 6,

    /** House Brilliance Member. */
    hypesquad_online_house_2 = 1 << 7,

    /** House Balance Member. */
    hypesquad_online_house_3 = 1 << 8,

    /** Early Nitro Supporter. */
    premium_early_supporter = 1 << 9,

    /** User is a team. */
    team_pseudo_user = 1 << 10,

    /** Bug Hunter Level 2. */
    bug_hunter_level_2 = 1 << 14,

    /** Verified Bot. */
    verified_bot = 1 << 16,

    /** Early Verified Bot Developer. */
    verified_developer = 1 << 17,

    /** Moderator Programs Alumni. */
    certified_moderator = 1 << 18,

    /** Bot uses only HTTP interactions and is shown in the online member list. */
    bot_http_interactions = 1 << 19,

    /** User is an Active Developer. */
    active_developer = 1 << 22,
};

export enum PrivateUserFlags {
    /** User has SMS 2FA enabled. */
    mfa_sms = 1 << 4,

    /** Unknown. Presumably some sort of Discord Nitro promotion that the user dismissed. */
    premium_promo_dismissed = 1 << 5,

    /** User has unread messages from Discord. */
    has_unread_urgent_messages = 1 << 13,

    /** Whether the user has verified the email. */
    verified_email = 1 << 43,
};

export enum OtherUserFlags {
    /** Account has been deleted. */
    deleted = 1 << 34,

    /** User is currently temporarily or permanently disabled. */
    disabled = 1 << 41,
};

export interface PublicUser {
    id: snowflake; // The user's id.
    discriminator: string; // The user's Discord-tag.
    username: string; // The user's username, not unique across the platform.
    global_name: string;  //The user's display name, if it is set. For bots, this is the application name.

    avatar: string; // The user's avatar hash.
    avatar_decoration?: string; // The user's avatar decoration hash.

    public_flags?: UserFlag; // The public flags on a user's account.
    bot?: boolean; // Whether the user belongs to an OAuth2 application.
};

export interface User extends PublicUser {
    email?: string; // The user's email.
    verified?: boolean; // Whether the email on this account has been verified.
    mfa_enabled?: boolean; // Whether the user has two factor enabled on their account.

    banner?: string; // The user's banner hash.
    accent_color?: number; // The user's banner color encoded as an integer representation of hexadecimal color code.

    flags?: UserFlag; // The flags on a user's account.
    system?: boolean; // Whether the user is an Official Discord System user (part of the urgent message system).
    premium_type?: number; // The type of Nitro subscription on a user's account.
    locale?: string; // The user's chosen language option.
}

enum RelationshipType {
	Friend = 1,
	Block = 2,
	IncomingFriendRequest = 3,
	OutgoingFriendRequest = 4,
}

/**
 * Relationship is a collection of all your contacts with other
 * users. It's represented by the `type` property.
 */
export interface Relationship {
	id: string;
	nickname?: string;
	type: RelationshipType;
	user: PublicUser;
};
