use serde::{ Deserialize, Serialize };

use crate::discord::user::PublicUser;

use super::{ sticker::Sticker, role::Role, channel::partial_channels::{ GuildChannel, self } };

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartialGuild {
	pub version: u64,
	pub threads: Vec<serde_json::Value>,
	pub stickers: Vec<Sticker>,
	pub stage_instances: Vec<serde_json::Value>,
	pub channels: Vec<partial_channels::GuildChannel>,
	pub roles: Vec<Role>,
	pub properties: GuildProperties,
}
impl PartialGuild {
	pub fn get_channel(&self, id: &str) -> Option<GuildChannel> {
		self.channels
			.iter()
			.find(|c| c.id == id)
			.cloned()
	}
}

///todo <br>
/// https://discord.com/developers/docs/resources/guild#guild-object
pub struct Guild {}

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