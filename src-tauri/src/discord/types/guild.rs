use serde::{ Deserialize, Serialize };

use crate::discord::user::PublicUser;

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