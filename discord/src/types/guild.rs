use serde::{ Deserialize, Serialize };
use serde_repr::{ Deserialize_repr, Serialize_repr };
use super::Snowflake;

// Discord Guild types based on the official documentation (https://discord.com/developers/docs/resources/guild)



/// https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level
#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Serialize_repr)]
pub enum DefaultMessageNotificationLevel {
    AllMessages = 0, // members will receive notifications for all messages by default
    OnlyMentions = 1, // members will receive notifications only for messages that @mention them by default
}

/// https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level
#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Serialize_repr)]
pub enum ExplicitContentFilterLevel {
    Disabled = 0, // media content will not be scanned
    MembersWithoutRoles = 1, // media content sent by members without roles will be scanned
    AllMembers = 2, // media content sent by all members will be scanned
}

/// https://discord.com/developers/docs/resources/guild#guild-object-mfa-level
#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Serialize_repr)]
pub enum MFALevel {
    None = 0, // guild has no MFA/2FA requirement for moderation actions
    Elevated = 1, // guild has a 2FA requirement for moderation actions
}

/// https://discord.com/developers/docs/resources/guild#guild-object-verification-level
#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Serialize_repr)]
pub enum VerificationLevel {
    None = 0, // unrestricted
    Low = 1, // must have verified email on account
    Medium = 2, // must be registered on Discord for longer than 5 minutes
    High = 3, // must be a member of the server for longer than 10 minutes
    VeryHigh = 4, // must have a verified phone number
}

/// https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level
#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Serialize_repr)]
pub enum NSFWLevel {
    Default = 0,
    Explicit = 1,
    Safe = 2,
    AgeRestricted = 3,
}

/// https://discord.com/developers/docs/resources/guild#guild-object-premium-tier
#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Serialize_repr)]
pub enum PremiumTier {
    None = 0, // guild has not unlocked any Server Boost perks
    Tier1 = 1, // guild has unlocked Server Boost level 1 perks
    Tier2 = 2, // guild has unlocked Server Boost level 2 perks
    Tier3 = 3, // guild has unlocked Server Boost level 3 perks
}

/// https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags
type SystemChannelFlags = u8;

#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Serialize_repr)]
pub enum SystemChannelFlag {
    SuppressJoinNotifications = 1 << 0, // Suppress member join notifications
    SuppressPremiumSubscriptions = 1 << 1, // Suppress server boost notifications
    SuppressGuildReminderNotifications = 1 << 2, // Suppress server setup tips
    SuppressJoinNotificationReplies = 1 << 3, // Hide member join sticker reply buttons
    SuppressRoleSubscriptionPurchaseNotifications = 1 << 4, // Suppress role subscription purchase and renewal notifications
    SuppressRoleSubscriptionPurchaseNotificationReplies = 1 << 5, // Hide role subscription sticker reply buttons
}

/// https://discord.com/developers/docs/resources/guild#guild-object-guild-features
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum GuildFeature {
    AnimatedBanner, // guild has access to set an animated guild banner image
    AnimatedIcon, // guild has access to set an animated guild icon
    ApplicationCommandPermissionsV2, // guild is using the old permissions configuration behavior
    AutoModeration, // guild has set up auto moderation rules
    Banner, // guild has access to set a guild banner image
    Community, // guild can enable welcome screen, Membership Screening, stage channels and discovery, and receives community updates
    CreatorMonetizableProvisional, // guild has enabled monetization
    CreatorStorePage, // guild has enabled the role subscription promo page
    DeveloperSupportServer, // guild has been set as a support server on the App Directory
    Discoverable, // guild is able to be discovered in the directory
    Featurable, // guild is able to be featured in the directory
    InvitesDisabled, // guild has paused invites, preventing new users from joining
    InviteSplash, // guild has access to set an invite splash background
    MemberVerificationGateEnabled, // guild has enabled Membership Screening
    MoreStickers, // guild has increased custom sticker slots
    News, // guild has access to create announcement channels
    Partnered, // guild is partnered
    PreviewEnabled, // guild can be previewed before joining via Membership Screening or the directory
    RaidAlertsDisabled, // guild has disabled alerts for join raids in the configured safety alerts channel
    RoleIcons, // guild is able to set role icons
    RoleSubscriptionsAvailableForPurchase, // guild has role subscriptions that can be purchased
    RoleSubscriptionsEnabled, // guild has enabled role subscriptions
    TicketedEventsEnabled, // guild has enabled ticketed events
    VanityUrl, // guild has access to set a vanity URL
    Verified, // guild is verified
    VipRegions, // guild has access to set 384kbps bitrate in voice (previously VIP voice servers)
    WelcomeScreenEnabled, // guild has enabled the welcome screen
}

/// https://discord.com/developers/docs/resources/guild#guild-object-mutable-guild-features
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum MutableGuildFeature {
    Community, // (Requires `administrator`) Enables Community Features in the guild
    Discoverable, // (Requires `administrator`, server also must be passing all discovery requirements) Enables discovery in the guild, making it publicly listed
    InvitesDisabled, // (Requires `manage guild`) Pauses all invites/access to the server
    RaidAlertsDisabled, // (Requires `manage guild`) Disables alerts for join raids
}

/// https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-flags
type GuildMemberFlags = u8;

#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Serialize_repr)]
pub enum GuildMemberFlag {
    DidRejoin = 1 << 0, // Member has left and rejoined the guild (editable: false)
    CompletedOnboarding = 1 << 1, // Member has completed onboarding (editable: false)
    BypassesVerification = 1 << 2, // Member is exempt from guild verification requirements (editable: true)
    StartedOnboarding = 1 << 3, // Member has started onboarding (editable: false)
}

/// https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors
#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Serialize_repr)]
pub enum IntegrationExpireBehavior {
    RemoveRole = 0,
    Kick = 1,
}

/// https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-mode
#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Serialize_repr)]
pub enum OnboardingMode {
    OnboardingDefault = 0, // Counts only Default Channels towards constraints
    OnboardingAdvanced = 1, // Counts Default Channels and Questions towards constraints
}

/// https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-types
#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Serialize_repr)]
pub enum PromptTypes {
    MultipleChoice = 0,
    Dropdown = 1,
}

/// https://discord.com/developers/docs/resources/guild#get-guild-widget-image-widget-style-options
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum WidgetStyle {
    Shield, // shield style widget with Discord icon and guild members online count (https://discord.com/api/guilds/81384788765712384/widget.png?style=shield)
    Banner1, // large image with guild icon, name and online count. "POWERED BY DISCORD" as the footer of the widget (https://discord.com/api/guilds/81384788765712384/widget.png?style=banner1)
    Banner2, // smaller widget style with guild icon, name and online count. Split on the right with Discord logo (https://discord.com/api/guilds/81384788765712384/widget.png?style=banner2)
    Banner3, // large image with guild icon, name and online count. In the footer, Discord logo on the left and "Chat Now" on the right (https://discord.com/api/guilds/81384788765712384/widget.png?style=banner3)
    Banner4, // large Discord logo at the top of the widget. Guild icon, name and online count in the middle portion of the widget and a "JOIN MY SERVER" button at the bottom (https://discord.com/api/guilds/81384788765712384/widget.png?style=banner4)
}


/// https://discord.com/developers/docs/resources/guild#guild-object-guild-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct Guild {
    pub id: Snowflake, // guild id
    pub name: String, // guild name (2-100 characters, excluding trailing and leading whitespace)
    pub icon: Option<String>, // icon hash
    pub icon_hash: Option<String>, // icon hash, returned when in the template object
    pub splash: Option<String>, // splash hash
    pub discovery_splash: Option<String>, // discovery splash hash; only present for guilds with the "DISCOVERABLE" feature
    // These field is only sent when using the GET Current User Guilds endpoint and are relative to the requested user
    // https://discord.com/developers/docs/resources/user#get-current-user-guilds
    pub owner: Option<bool>, // true if the user is the owner of the guild
    pub owner_id: Snowflake, // id of owner
    // These field is only sent when using the GET Current User Guilds endpoint and are relative to the requested user
    // https://discord.com/developers/docs/resources/user#get-current-user-guilds
    pub permissions: Option<String>, // total permissions for the user in the guild (excludes overwrites and implicit permissions)
    // This field is deprecated and is replaced by channel.rtc_region
    // https://discord.com/developers/docs/resources/channel#channel-object-channel-structure
    pub region: Option<String>, // voice region id for the guild (deprecated)
    pub afk_channel_id: Option<Snowflake>, // id of afk channel
    pub afk_timeout: i64, // afk timeout in seconds
    pub widget_enabled: Option<bool>, // true if the server widget is enabled
    pub widget_channel_id: Option<Snowflake>, // the channel id that the widget will generate an invite to, or null if set to no invite
    pub verification_level: VerificationLevel, // verification level required for the guild
    pub default_message_notifications: DefaultMessageNotificationLevel, // default message notifications level
    pub explicit_content_filter: ExplicitContentFilterLevel, // explicit content filter level
    // TODO: pub roles: array of role objects, // roles in the guild
    // TODO: pub emojis: array of emoji objects, // custom guild emojis
    pub features: Vec<GuildFeature>, // enabled guild features
    pub mfa_level: MFALevel, // required MFA level for the guild
    pub application_id: Option<Snowflake>, // application id of the guild creator if it is bot-created
    pub system_channel_id: Option<Snowflake>, // the id of the channel where guild notices such as welcome messages and boost events are posted
    pub system_channel_flags: SystemChannelFlags, // system channel flags
    pub rules_channel_id: Option<Snowflake>, // the id of the channel where Community guilds can display rules and/or guidelines
    pub max_presences: Option<u64>, // the maximum number of presences for the guild (null is always returned, apart from the largest of guilds)
    pub max_members: Option<u64>, // the maximum number of members for the guild
    pub vanity_url_code: Option<String>, // the vanity url code for the guild
    pub description: Option<String>, // the description of a guild
    pub banner: Option<String>, // banner hash
    pub premium_tier: PremiumTier, // premium tier (Server Boost level)
    pub premium_subscription_count: Option<u64>, // the number of boosts this guild currently has
    pub preferred_locale: String, // the preferred locale of a Community guild; used in server discovery and notices from Discord, and sent in interactions; defaults to "en-US"
    pub public_updates_channel_id: Option<Snowflake>, // the id of the channel where admins and moderators of Community guilds receive notices from Discord
    pub max_video_channel_users: Option<u64>, // the maximum amount of users in a video channel
    pub max_stage_video_channel_users: Option<u64>, // the maximum amount of users in a stage video channel
    pub approximate_member_count: Option<u64>, // approximate number of members in this guild, returned from the GET /guilds/<id> and /users/@me/guilds endpoints when with_counts is true
    pub approximate_presence_count: Option<u64>, // approximate number of non-offline members in this guild, returned from the GET /guilds/<id> and /users/@me/guilds endpoints when with_counts is true
    // TODO: pub welcome_screen?: welcome screen object, // the welcome screen of a Community guild, shown to new members, returned in an Invite's guild object
    pub nsfw_level: NSFWLevel, // guild NSFW level
    // TODO: pub stickers?: array of sticker objects, // custom guild stickers
    pub premium_progress_bar_enabled: bool, // whether the guild has the boost progress bar enabled
    pub safety_alerts_channel_id: Option<Snowflake>, // the id of the channel where admins and moderators of Community guilds receive safety alerts from Discord
}

/// https://discord.com/developers/docs/resources/guild#guild-preview-object-guild-preview-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct GuildPreview {
    pub id: Snowflake, // guild id
    pub name: String, // guild name (2-100 characters)
    pub icon: Option<String>, // icon hash
    pub splash: Option<String>, // splash hash
    pub discovery_splash: Option<String>, // discovery splash hash
    // TODO: pub emojis: array of emoji objects, // custom guild emojis
    pub features: Vec<GuildFeature>, // enabled guild features
    pub approximate_member_count: u64, // approximate number of members in this guild
    pub approximate_presence_count: u64, // approximate number of online members in this guild
    pub description: Option<String>, // the description for the guild
    // TODO: pub stickers: array of sticker objects, // custom guild stickers
}

/// https://discord.com/developers/docs/resources/guild#guild-widget-settings-object-guild-widget-settings-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct GuildWidgetSettings {
    pub enabled: bool, // whether the widget is enabled
    pub channel_id: Option<Snowflake>, // the widget channel id
}

/// https://discord.com/developers/docs/resources/guild#guild-widget-object-guild-widget-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct GuildWidget {
    pub id: Snowflake, // guild id
    pub name: String, // guild name (2-100 characters)
    pub instant_invite: Option<String>, // instant invite for the guilds specified widget invite channel
    // TODO: pub channels: array of partial channel objects, // voice and stage channels which are accessible by @everyone
    // TODO: pub members: array of partial user objects, // special widget user objects that includes users presence (Limit 100)
    pub presence_count: u64, // number of online members in this guild
}

/// https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct GuildMember {
    // TODO: pub user?: user, // object the user this guild member represents
    pub nick: Option<String>, // this user's guild nickname
    pub avatar: Option<String>, // the member's guild avatar hash
    pub roles: Vec<Snowflake>, // array of role object ids
    // TODO: pub joined_at: ISO8601, // timestamp when the user joined the guild
    // TODO: pub premium_since?: ?ISO8601, // timestamp when the user started boosting the guild
    pub deaf: bool, // whether the user is deafened in voice channels
    pub mute: bool, // whether the user is muted in voice channels
    pub flags: GuildMemberFlags, // guild member flags represented as a bit set, defaults to 0
    pub pending: Option<bool>, // whether the user has not yet passed the guild's Membership Screening requirements
    // TODO: This value may potentialy be replaced by an enum???
    pub permissions: Option<String>, // total permissions of the member in the channel, including overwrites, returned when in the interaction object
    // TODO: pub communication_disabled_until?: ?ISO8601, // timestamp when the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out
    // TODO: pub avatar_decoration_data?: ?avatar decoration data object, // data for the member's guild avatar decoration
}

/// https://discord.com/developers/docs/resources/guild#integration-object-integration-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct Integration {
    pub id: Snowflake, // integration id
    pub name: String, // integration name
    pub r#type: String, // integration type (twitch, youtube, discord, or guild_subscription)
    pub enabled: bool, // is this integration enabled
    /// These field is not provided for discord bot integrations.
    pub syncing: Option<bool>, // is this integration syncing
    /// These field is not provided for discord bot integrations.
    pub role_id: Option<Snowflake>, // id that this integration uses for "subscribers"
    /// These field is not provided for discord bot integrations.
    pub enable_emoticons: Option<bool>, // whether emoticons should be synced for this integration (twitch only currently)
    /// These field is not provided for discord bot integrations.
    pub expire_behavior: Option<IntegrationExpireBehavior>, // the behavior of expiring subscribers
    /// These field is not provided for discord bot integrations.
    pub expire_grace_period: Option<u64>, // the grace period (in days) before expiring subscribers
    // TODO: pub user?: user object, // user for this integration
    pub account: IntegrationAccount, // integration account information
    /// These field is not provided for discord bot integrations.
    // TODO: pub synced_at?: *ISO8601 timestamp, // when this integration was last synced
    /// These field is not provided for discord bot integrations.
    pub subscriber_count: Option<u64>, // how many subscribers this integration has
    /// These field is not provided for discord bot integrations.
    pub revoked: Option<bool>, // has this integration been revoked
    pub application: Option<IntegrationApplication>, // The bot/OAuth2 application for discord integrations
    // TODO: pub scopes?: array of OAuth2 scopes, // the scopes the application has been authorized for
}

/// https://discord.com/developers/docs/resources/guild#integration-account-object-integration-account-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct IntegrationAccount {
    pub id: String, // id of the account
    pub name: String, // name of the account
}

/// https://discord.com/developers/docs/resources/guild#integration-application-object-integration-application-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct IntegrationApplication {
    pub id: Snowflake, // the id of the app
    pub name: String, // the name of the app
    pub icon: Option<String>, // the icon hash of the app
    pub description: String, // the description of the app
    // TODO: pub bot?: user object, // the bot associated with this application
}

/// https://discord.com/developers/docs/resources/guild#ban-object-ban-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct Ban {
    pub reason: Option<String>, // the reason for the ban
    // TODO: pub user: user, // object the banned user
}

/// https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct WelcomeScreen {
    pub description: Option<String>, // the server description shown in the welcome screen
    pub welcome_channels: Vec<WelcomeScreenChannel>, // the channels shown in the welcome screen, up to 5
}

/// https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-channel-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct WelcomeScreenChannel {
    pub channel_id: Snowflake, // the channel's id
    pub description: String, // the description shown for the channel
    pub emoji_id: Option<Snowflake>, // the emoji id, if the emoji is custom
    pub emoji_name: Option<String>, // the emoji name if custom, the unicode character if standard, or null if no emoji is set
}

/// https://discord.com/developers/docs/resources/guild#guild-onboarding-object-guild-onboarding-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct GuildOnboardingStructure {
    pub guild_id: Snowflake, // ID of the guild this onboarding is part of
    pub prompts: Vec<OnboardingPrompt>, // Prompts shown during onboarding and in customize community
    pub default_channel_ids: Vec<Snowflake>, // Channel IDs that members get opted into automatically
    pub enabled: bool, // Whether onboarding is enabled in the guild
    // TODO: pub mode: onboarding mode, // Current mode of onboarding
}

/// https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-prompt-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct OnboardingPrompt {
    pub id: Snowflake, // ID of the prompt
    // TODO: pub r#type: prompt type, // Type of prompt
    pub options: Vec<PromptOptionStucture>, // Options available within the prompt
    pub title: String, // Title of the prompt
    pub single_select: bool, // Indicates whether users are limited to selecting one option for the prompt
    pub required: bool, // Indicates whether the prompt is required before a user completes the onboarding flow
    pub in_onboarding: bool, // Indicates whether the prompt is present in the onboarding flow. If false, the prompt will only appear in the Channels & Roles tab
}

/// https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-option-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct PromptOptionStucture {
    pub id: Snowflake, // ID of the prompt option
    pub channel_ids: Vec<Snowflake>, // IDs for channels a member is added to when the option is selected
    pub role_ids: Vec<Snowflake>, // IDs for roles assigned to a member when the option is selected
    // TODO: pub emoji?: emoji object, // Emoji of the option (see below)
    pub emoji_id: Option<Snowflake>, // Emoji ID of the option (see below)
    pub emoji_name: Option<String>, // Emoji name of the option (see below)
    pub emoji_animated: Option<bool>, // Whether the emoji is animated (see below)
    pub title: String, // Title of the option
    pub description: Option<String>, // Description of the option
}


pub mod http {
    use super::*;

    /// https://discord.com/developers/docs/resources/guild#create-guild-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct CreateGuild {
        pub name: String, // name of the guild (2-100 characters)
        pub region: Option<String>, // voice region id (deprecated)
        // TODO: pub icon?: image, // data base64 128x128 image for the guild icon
        pub verification_level: Option<VerificationLevel>, // verification level
        pub default_message_notifications: Option<DefaultMessageNotificationLevel>, // default message notification level
        pub explicit_content_filter: Option<ExplicitContentFilterLevel>, // explicit content filter level
        // TODO: pub roles?: array of role objects, // new guild roles
        // TODO: pub channels?: array of partial channel objects, // new guild's channels
        pub afk_channel_id: Option<Snowflake>, // id for afk channel
        pub afk_timeout: Option<u64>, // afk timeout in seconds, can be set to: 60, 300, 900, 1800, 3600
        pub system_channel_id: Option<Snowflake>, // the id of the channel where guild notices such as welcome messages and boost events are posted
        pub system_channel_flags: Option<SystemChannelFlags>, // system channel flags
    }

    /// https://discord.com/developers/docs/resources/guild#get-guild-query-string-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct GetGuild {
        pub with_counts: Option<bool>, // when true, will return approximate member and presence counts for the guild (required: false) (default: false)
    }

    /// https://discord.com/developers/docs/resources/guild#modify-guild-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct ModifyGuild {
        pub name: Option<String>, // guild name
        pub region: Option<String>, // guild voice region id (deprecated)
        pub verification_level: Option<VerificationLevel>, // verification level
        pub default_message_notifications: Option<DefaultMessageNotificationLevel>, // default message notification level
        pub explicit_content_filter: Option<ExplicitContentFilterLevel>, // explicit content filter level
        pub afk_channel_id: Option<Snowflake>, // id for afk channel
        pub afk_timeout: Option<u64>, // afk timeout in seconds, can be set to: 60, 300, 900, 1800, 3600
        // TODO: pub icon: Option<image>, // data base64 1024x1024 png/jpeg/gif image for the guild icon (can be animated gif when the server has the ANIMATED_ICON feature)
        pub owner_id: Option<Snowflake>, // user id to transfer guild ownership to (must be owner)
        // TODO: pub splash: Option<image>, // data base64 16:9 png/jpeg image for the guild splash (when the server has the INVITE_SPLASH feature)
        // TODO: pub discovery_splash: Option<image>, // data base64 16:9 png/jpeg image for the guild discovery splash (when the server has the DISCOVERABLE feature)
        // TODO: pub banner: Option<image>, // data base64 16:9 png/jpeg image for the guild banner (when the server has the BANNER feature; can be animated gif when the server has the ANIMATED_BANNER feature)
        pub system_channel_id: Option<Snowflake>, // the id of the channel where guild notices such as welcome messages and boost events are posted
        pub system_channel_flags: Option<SystemChannelFlags>, // system channel flags
        pub rules_channel_id: Option<Snowflake>, // the id of the channel where Community guilds display rules and/or guidelines
        pub public_updates_channel_id: Option<Snowflake>, // the id of the channel where admins and moderators of Community guilds receive notices from Discord
        pub preferred_locale: Option<String>, // the preferred locale of a Community guild used in server discovery and notices from Discord; defaults to "en-US"
        pub features: Option<Vec<GuildFeature>>, // enabled guild features
        pub description: Option<String>, // the description for the guild
        pub premium_progress_bar_enabled: Option<bool>, // whether the guild's boost progress bar should be enabled
        pub safety_alerts_channel_id: Option<Snowflake>, // the id of the channel where admins and moderators of Community guilds receive safety alerts from Discord
    }

    /// https://discord.com/developers/docs/resources/guild#create-guild-channel-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct CreateGuildChannel {
        pub name: String, // channel name (1-100 characters) (Channel type: All)
        // TODO: pub r#type: Option<integer>, // the type of channel (Channel type: All)
        pub topic: Option<String>, // channel topic (0-1024 characters) (Channel type: Text, Announcement, Forum, Media)
        /// https://discord.com/developers/docs/resources/guild#guild-object-guild-features
        /// For voice channels, normal servers can set bitrate up to 96000, servers with Boost level 1 can set up to 128000, servers with Boost level 2 can set up to 256000, and servers with Boost level 3 or the VIP_REGIONS guild feature can set up to 384000. For stage channels, bitrate can be set up to 64000.
        pub bitrate: Option<u64>, // the bitrate (in bits) of the voice or stage channel; min 8000 (Channel type: Voice, Stage)
        pub user_limit: Option<u64>, // the user limit of the voice channel (Channel type: Voice, Stage)
        pub rate_limit_per_user: Option<u64>, // amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission manage_messages or manage_channel, are unaffected (Channel type: Text, Voice, Stage, Forum, Media)
        // TODO: Potentially an enum???
        pub position: Option<u64>, // sorting position of the channel (Channel type: All)
        /// In each overwrite object, the allow and deny keys can be omitted or set to null, which both default to "0".
        // TODO: pub permission_overwrites: Option<array of partial overwrite objects>, // the channel's permission overwrites (Channel type: All)
        pub parent_id: Option<Snowflake>, // id of the parent category for a channel (Channel type: Text, Voice, Announcement, Stage, Forum, Media)
        pub nsfw: Option<bool>, // whether the channel is nsfw (Channel type: Text, Voice, Announcement, Stage, Forum)
        pub rtc_region: Option<String>, // channel voice region id of the voice or stage channel, automatic when set to null (Channel type: Voice, Stage)
        pub video_quality_mode: Option<u64>, // the camera video quality mode of the voice channel (Channel type: Voice, Stage)
        pub default_auto_archive_duration: Option<u64>, // the default duration that the clients use (not the API) for newly created threads in the channel, in minutes, to automatically archive the thread after recent activity (Channel type: Text, Announcement, Forum, Media)
        // TODO: pub default_reaction_emoji: Option<default reaction object>, // emoji to show in the add reaction button on a thread in a GUILD_FORUM or a GUILD_MEDIA channel (Channel type: Forum, Media)
        // TODO: pub available_tags: Option<array of tag objects>, // set of tags that can be used in a GUILD_FORUM or a GUILD_MEDIA channel (Channel type: Forum, Media)
        // TODO: pub default_sort_order: Option<integer>, // the default sort order type used to order posts in GUILD_FORUM and GUILD_MEDIA channels (Channel type: Forum, Media)
        // TODO: pub default_forum_layout: Option<integer>, // the default forum layout view used to display posts in GUILD_FORUM channels (Channel type: Forum)
        pub default_thread_rate_limit_per_user: Option<u64>, // the initial rate_limit_per_user to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update. (Channel type: Text, Announcement, Forum, Media)
    }

    /// https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct ModifyGuildChannelPosition {
        pub id: Snowflake, // channel id
        // TODO: pub position?: ?integer, // sorting position of the channel
        pub lock_permissions: Option<bool>, // syncs the permission overwrites with the new parent, if moving to a new category
        pub parent_id: Option<Snowflake>, // the new parent ID for the channel that is moved
    }

    /// https://discord.com/developers/docs/resources/guild#list-active-guild-threads-response-body
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct ListActiveGuildThreads {
        // TODO: pub threads: array of channel objects, // the active threads
        // TODO: pub members: array of thread members objects, // a thread member object for each returned thread the current user has joined
    }

    /// https://discord.com/developers/docs/resources/guild#list-guild-members-query-string-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct ListGuildMembers {
        pub limit: u64, // max number of members to return (1-1000) (Default: 1)
        pub after: Snowflake, // the highest user id in the previous page (Default: 0)
    }

    /// https://discord.com/developers/docs/resources/guild#search-guild-members-query-string-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct SearchGuildMembers {
        pub query: String, // Query string to match username(s) and nickname(s) against. (Default: "")
        pub limit: Option<u64>, // max number of members to return (1-1000) (Default: 1)
    }

    /// https://discord.com/developers/docs/resources/guild#add-guild-member-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct AddGuildMember {
        pub access_token: String, // an oauth2 access token granted with the guilds.join to the bot's application for the user you want to add to the guild 
        pub nick: Option<String>, // value to set user's nickname to (Permission: MANAGE_NICKNAMES)
        pub roles: Option<Vec<Snowflake>>, // array of role ids the member is assigned (Permission: MANAGE_ROLES)
        pub mute: Option<bool>, // whether the user is muted in voice channels (Permission: MUTE_MEMBERS)
        pub deaf: Option<bool>, // whether the user is deafened in voice channels (Permission: DEAFEN_MEMBERS)
    }

    /// https://discord.com/developers/docs/resources/guild#modify-guild-member-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct ModifyGuildMember {
        pub nick: Option<String>, // value to set user's nickname to (Permissions: MANAGE_NICKNAMES)
        pub roles: Option<Vec<Snowflake>>, // array of role ids the member is assigned (Permissions: MANAGE_ROLES)
        pub mute: Option<bool>, // whether the user is muted in voice channels. Will throw a 400 error if the user is not in a voice channel (Permissions: MUTE_MEMBERS)
        pub deaf: Option<bool>, // whether the user is deafened in voice channels. Will throw a 400 error if the user is not in a voice channel (Permissions: DEAFEN_MEMBERS)
        pub channel_id: Option<Snowflake>, // id of channel to move user to (if they are connected to voice) (Permissions: MOVE_MEMBERS)
        // TODO: pub communication_disabled_until: Option<ISO8601>, // timestamp when the user's timeout will expire and the user will be able to communicate in the guild again (up to 28 days in the future), set to null to remove timeout. Will throw a 403 error if the user has the ADMINISTRATOR permission or is the owner of the guild (Permissions: MODERATE_MEMBERS)
        pub flags: Option<GuildMemberFlags>, // guild member flags (Permissions: MANAGE_GUILD or MANAGE_ROLES or (MODERATE_MEMBERS and KICK_MEMBERS and BAN_MEMBERS))
    }

    /// https://discord.com/developers/docs/resources/guild#modify-current-member-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct ModifyCurrentMember {
        pub nick: Option<String>, // value to set user's nickname to (Permissions: CHANGE_NICKNAME)
    }

    /// https://discord.com/developers/docs/resources/guild#get-guild-bans-query-string-params
    /// Provide a user id to before and after for pagination. Users will always be returned in ascending order by user.id. If both before and after are provided, only before is respected.
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct GetGuildBans {
        pub limit: Option<u64>, // number of users to return (up to maximum 1000) (Default: 1000)
        pub before: Option<Snowflake>, // snowflake consider only users before given user id (Default: null)
        pub after: Option<Snowflake>, // snowflake consider only users after given user id (Default: null)
    }

    /// https://discord.com/developers/docs/resources/guild#create-guild-ban-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct CreateGuildBan {
        pub delete_message_days: Option<u64>, // number of days to delete messages for (0-7) (deprecated) (Default: 0)
        pub delete_message_seconds: Option<u64>, // number of seconds to delete messages for, between 0 and 604800 (7 days) (Default: 0)
    }

    /// https://discord.com/developers/docs/resources/guild#bulk-guild-ban-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct BulkGuildBan {
        pub user_ids: Vec<Snowflake>, // list of user ids to ban (max 200) 
        pub delete_message_seconds: Option<u64>, // number of seconds to delete messages for, between 0 and 604800 (7 days) 0
    }

    /// https://discord.com/developers/docs/resources/guild#bulk-guild-ban-bulk-ban-response
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct BulkGuildBanResponse {
        pub banned_users: Vec<Snowflake>, // list of user ids, that were successfully banned
        pub failed_users: Vec<Snowflake>, // list of user ids, that were not banned
    }

    /// https://discord.com/developers/docs/resources/guild#create-guild-role-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct CreateGuildRole {
        pub name: String, // name of the role, max 100 characters (Default: "new role")
        pub permissions: String, // bitwise value of the enabled/disabled permissions (Default: @everyone permissions in guild)
        pub color: u64, // RGB color value (Default: 0)
        pub hoist: bool, // whether the role should be displayed separately in the sidebar (Default: false)
        // TODO: pub icon: ?image, // data the role's icon image (if the guild has the ROLE_ICONS feature) (Default: null)
        pub unicode_emoji: String, // the role's unicode emoji as a standard emoji (if the guild has the ROLE_ICONS feature) (Default: null)
        pub mentionable: bool, // whether the role should be mentionable (Default: false)
    }

    /// https://discord.com/developers/docs/resources/guild#modify-guild-role-positions-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct ModifyGuildRolePosition {
        pub id: Snowflake, // role
        // TODO: pub position?: ?integer, // sorting position of the role
    }

    /// https://discord.com/developers/docs/resources/guild#modify-guild-role-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct ModifyGuildRole {
        pub name: Option<String>, // name of the role, max 100 characters
        pub permissions: Option<String>, // bitwise value of the enabled/disabled permissions
        pub color: Option<u64>, // RGB color value
        pub hoist: Option<bool>, // whether the role should be displayed separately in the sidebar
        // TODO: pub icon: Option<image>, // data the role's icon image (if the guild has the ROLE_ICONS feature)
        pub unicode_emoji: Option<String>, // the role's unicode emoji as a standard emoji (if the guild has the ROLE_ICONS feature)
        pub mentionable: Option<bool>, // whether the role should be mentionable
    }

    /// https://discord.com/developers/docs/resources/guild#modify-guild-mfa-level-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct ModifyGuildMFALevel {
        pub level: MFALevel,
    }

    /// https://discord.com/developers/docs/resources/guild#get-guild-prune-count-query-string-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct GetGuildPruneCount {
        pub days: u64, // number of days to count prune for (1-30) (Default: 7)
        // TODO: This might not be a string but an array in the newer version, look into the API
        pub include_roles: String, //role(s) to include (Default: none)
    }

    /// https://discord.com/developers/docs/resources/guild#begin-guild-prune-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct BeginGuildPrune {
        pub days: u64, // number of days to prune (1-30) (Default: 7)
        pub compute_prune_count: bool, // whether pruned is returned, discouraged for large guilds (Default: true)
        pub include_roles: Vec<Snowflake>, // role(s) to include (Default: none)
        pub reason: Option<String>, // reason for the prune (deprecated) 
    }

    /// https://discord.com/developers/docs/resources/guild#get-guild-widget-image-query-string-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct GetGuildWidgetImage {
        pub style: WidgetStyle, // style of the widget image returned (see below) (Default: shield)
    }

    /// https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct ModifyGuildWelcomeScreen {
        pub enabled: Option<bool>, // whether the welcome screen is enabled
        pub welcome_channels: Option<Vec<WelcomeScreenChannel>>, // channels linked in the welcome screen and their display options
        pub description: Option<String>, // the server description to show in the welcome screen
    }

    /// https://discord.com/developers/docs/resources/guild#modify-guild-onboarding-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct ModifyGuildOnboarding {
        pub prompts: Vec<OnboardingPrompt>, // Prompts shown during onboarding and in customize community
        pub default_channel_ids: Vec<Snowflake>, // Channel IDs that members get opted into automatically
        pub enabled: bool, // Whether onboarding is enabled in the guild
        pub mode: OnboardingMode, // Current mode of onboarding
    }

    /// https://discord.com/developers/docs/resources/guild#modify-current-user-voice-state-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct ModifyCurrentUserVoiceState {
        pub channel_id: Option<Snowflake>, // the id of the channel the user is currently in
        pub suppress: Option<bool>, // toggles the user's suppress state
        // TODO: pub request_to_speak_timestamp?: ?ISO8601, // timestamp sets the user's request to speak
    }

    /// https://discord.com/developers/docs/resources/guild#modify-user-voice-state-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct ModifyUserVoiceState {
        pub channel_id: Snowflake, // the id of the channel the user is currently in
        pub suppress: Option<bool>, // toggles the user's suppress state
    }
}
