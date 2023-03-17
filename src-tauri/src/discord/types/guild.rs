use serde::{ Deserialize, Serialize };

use crate::discord::user::PublicUser;

use super::{ sticker::Sticker, role::Role };

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Guild {
	version: u64,
	threads: Vec<serde_json::Value>,
	stickers: Vec<Sticker>,
	stage_instances: Vec<serde_json::Value>,
	roles: Vec<Role>,
	properties: GuildProperties,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GuildMember {
	pub user: Option<PublicUser>,
	pub nick: Option<String>,
	pub avatar: Option<String>,
	pub roles: Vec<String>,
	pub joined_at: String,
	pub premium_since: Option<String>,
	pub deaf: bool,
	pub mute: bool,
	pub flags: u64, //todo custom deserializer
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
	pub description: Option<String>,
	pub discovery_splash: Option<String>,
	pub explicit_content_filter: u64,
	pub icon: Option<String>,
	pub banner: Option<String>,
	pub public_updates_channel_id: Option<String>,
	pub preferred_locale: String,
	pub default_message_notifications: u64,
	pub system_channel_id: Option<String>,
}