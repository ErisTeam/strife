use serde::{ Deserialize, Serialize };
use serde_repr::{ Deserialize_repr, Serialize_repr };

use crate::discord::types::user::{ PublicUser, UserFlags };

use super::{ channel::partial_channels::{ self, GuildChannel }, role::Role, sticker::PartialSticker };

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartialGuild {
	pub version: u64,
	pub threads: Vec<serde_json::Value>,
	pub stickers: Vec<PartialSticker>,
	pub stage_instances: Vec<serde_json::Value>,
	pub channels: Vec<partial_channels::GuildChannel>,
	pub roles: Vec<Role>,
	pub properties: GuildProperties,
}
impl PartialGuild {
	pub fn get_channel(&self, id: &str) -> Option<GuildChannel> {
		self.channels
			.iter()
			.find(|c| c.get_id() == id)
			.cloned()
	}
}

///TODO: <br>
/// https://discord.com/developers/docs/resources/guild#guild-object
pub struct Guild {
	pub id: String,
	pub name: String,
	pub icon: Option<String>,
	pub icon_hash: Option<String>,
	pub splash: Option<String>,
	pub discovery_splash: Option<String>,
	pub owner: Option<bool>,
	pub owner_id: String,
	///only when https://discord.com/developers/docs/resources/user#get-current-user-guilds is used
	pub permissions: Option<String>,
	pub region: Option<String>,
	pub afk_channel_id: Option<String>,
	pub afk_timeout: u64,
	pub widget_enabled: Option<bool>,
	pub widget_channel_id: Option<String>,
	pub verification_level: u8, //might want to change to enum or constants
	pub default_message_notifications: u8, //might want to change to enum or constants
	pub explicit_content_filter: u8, //might want to change to enum or constants
	pub roles: Vec<Role>,
	pub emojis: Vec<serde_json::Value>, //TODO: create emoji struct
	pub features: Vec<serde_json::Value>, //TODO: create value struct
	pub mfa_level: u8, //might want to change to enum or constants
	pub application_id: Option<String>,
	pub system_channel_id: Option<String>,
	pub system_channel_flags: u8, //might want to change to enum or constants
	pub rules_channel_id: Option<String>,
	pub max_presences: Option<u64>,
	pub max_members: Option<u64>,
	pub vanity_url_code: Option<String>,
	pub description: Option<String>,
	pub banner: Option<String>,
	pub premium_tier: u8, //might want to change to enum or constants
	pub premium_subscription_count: Option<u64>,
	pub preferred_locale: String,
	pub public_updates_channel_id: Option<String>,
	pub max_video_channel_users: Option<u64>,
	pub max_stage_video_channel_users: Option<u64>,
	pub approximate_member_count: Option<u64>,
	pub approximate_presence_count: Option<u64>,
	pub welcome_screen: Option<serde_json::Value>, //TODO: create welcome screen struct
	pub nsfw_level: u8, //might want to change to enum or constants
	pub stickers: Vec<PartialSticker>, //TODO: create sticker struct
	pub premium_progress_bar_enabled: bool,
	pub safety_alerts_channel_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GuildMember {
	pub user: Option<PublicUser>,
	pub nick: Option<String>,
	pub avatar: Option<String>,
	#[serde(default)]
	pub roles: Vec<String>,
	pub joined_at: String,
	pub premium_since: Option<String>,
	pub deaf: bool,
	pub mute: bool,

	///public flags
	pub flags: UserFlags,
	pub pending: bool,
	pub permissions: Option<String>,
	pub comunication_disabled_until: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GuildMemberFlag {
	DidRejoin = 0,
	CompletedOnboarding = 1,
	BypassVerification = 2,
	StartedOnboarding = 3,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GuildProperties {
	pub id: String,
	pub owner_id: String,
	pub description: Option<String>,
	pub icon: Option<String>,
	pub name: String,

	pub nsfw_level: NSFWLevel,
	pub nsfw: bool,
	pub explicit_content_filter: u64,

	pub system_channel_flags: u8,
	pub verification_level: u8,
	pub mfa_level: u8,
	pub preferred_locale: String,

	pub hub_type: Option<serde_json::Value>, //https://discord-api-types.dev/api/discord-api-types-v10/interface/APIGuild#hub_type,
	pub home_header: Option<serde_json::Value>,

	pub rules_channel_id: Option<String>,
	pub system_channel_id: Option<String>,
	pub public_updates_channel_id: Option<String>,
	pub safety_alerts_channel_id: Option<String>,

	pub afk_timeout: u64,
	pub afk_channel_id: Option<String>,

	pub premium_tier: u64,
	pub premium_progress_bar_enabled: bool,

	pub splash: Option<String>,
	pub discovery_splash: Option<String>,

	pub features: Vec<String>, //TODO: custom deserializer

	pub default_message_notifications: u64,

	pub banner: Option<String>,

	pub vanity_url_code: Option<String>,

	pub latest_onboarding_question_id: Option<String>,

	pub max_video_channel_users: u64,
	pub max_stage_video_channel_users: u64,
	pub max_members: u64,

	pub application_id: Option<String>,
}

//TODO: move it to a better place
#[derive(Debug, Clone, Serialize_repr, Deserialize_repr)]
#[repr(u8)]
pub enum NSFWLevel {
	Default = 0,
	Explicit = 1,
	Safe = 2,
	AgeRestricted = 3,
}
