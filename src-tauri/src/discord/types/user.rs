use serde::{ Deserialize, Serialize };

//TODO: clean this file

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CurrentUser {
	pub verified: bool,
	pub username: String,
	pub purchased_flags: u64,
	pub premium_type: Option<u64>,
	pub premium: bool,
	pub phone: Option<String>,
	pub nsfw_allowed: bool,
	pub mobile: bool,
	pub mfa_enabled: bool,
	pub id: String,

	pub flags: UserFlags,

	pub email: Option<String>,
	pub global_name: Option<String>,
	pub discriminator: String,
	pub desktop: bool,
	pub bio: Option<String>,
	pub banner_color: Option<String>,
	pub banner: Option<String>,
	pub avatar_decoration: Option<String>,
	pub avatar: Option<String>,
	pub accent_color: Option<u64>,
}
impl CurrentUser {
	pub fn get_name(&self) -> String {
		if let Some(name) = &self.global_name { name.clone() } else { self.username.clone() }
	}
}
///https://discord.com/developers/docs/resources/user#user-object
/// TODO: change name
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserA {
	pub id: String,
	pub username: String,
	pub discriminator: String,
	pub global_name: Option<String>,
	pub avatar: Option<String>,
	pub bot: Option<bool>,
	pub system: Option<bool>,
	pub mfa_enabled: Option<bool>,
	pub banner: Option<String>,
	pub accent_color: Option<u64>,
	pub locale: Option<String>,
	pub verified: Option<bool>,
	pub email: Option<String>,
	pub flags: Option<UserFlags>,
	pub premium_type: Option<u64>,
	pub public_flags: Option<UserFlags>,
	pub avatar_decoration: Option<String>,
}
impl UserA {
	pub fn get_name(&self) -> String {
		if let Some(name) = &self.global_name { name.clone() } else { self.username.clone() }
	}
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicUser {
	pub username: String,
	pub public_flags: u64,
	pub id: String,
	pub global_name: Option<String>,
	pub discriminator: String,
	pub bot: Option<bool>,
	pub avatar_decoration: Option<String>,
	pub avatar: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct GuildSettings {
	pub version: u64,
	pub partial: bool,
	pub entries: Vec<GuildSettingsEntry>,
}
#[derive(Deserialize, Debug, Clone)]
pub struct GuildSettingsEntry {
	pub version: u64,
	pub suppress_roles: bool,
	pub suppress_everyone: bool,
	pub notify_highlights: u16, //
	pub muted: bool,
	pub mute_scheduled_events: bool,
	pub muted_config: Option<MuteConfig>,
	pub mobile_push: bool,
	pub message_notifications: u16,
	pub hide_muted_channels: bool,
	pub guild_id: Option<String>,
	pub flags: u64,
	pub channel_overrides: Vec<ChannelOverride>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct ChannelOverride {
	pub muted: bool,
	pub mute_config: Option<MuteConfig>,
	pub message_notifications: u16,
	pub collapsed: bool,
	pub channel_id: String,
}
#[derive(Deserialize, Debug, Clone)]
pub struct MuteConfig {
	pub selected_time_window: Option<i64>, //TODO: custom deserializer -1 = none
	pub end_time: Option<String>,
}

pub type UserFlags = u64;

///Source: https://flags.lewisakura.moe/
pub mod user_flags {
	pub mod private {
		///User has SMS 2FA enabled.
		const MFA_SMS: u64 = 1 << 4;
		const VERIFIED_EMAIL: u64 = 1 << 43;
		///Unknown. Presumably some sort of Discord Nitro promotion that the user dismissed.
		const PREMIUM_PROMO_DISMISSED: u64 = 1 << 5;
		///User has unread messages from Discord.
		const HAS_UNREAD_URGENT_MESSAGES: u64 = 1 << 13;
	}
	pub mod public {
		///User is a Discord employee.
		const STAFF: u64 = 1 << 0;
		///User is a Discord partner.
		const PARTNER: u64 = 1 << 1;
		///User is a HypeSquad Events member.
		const HYPE_SQUAD_EVENTS: u64 = 1 << 2;
		///User is a Bug Hunter.
		const BUG_HUNTER_LEVEL_1: u64 = 1 << 3;
		const BUG_HUNTER_LEVEL_2: u64 = 1 << 14;

		///User is part of HypeSquad Bravery.
		const HOUSE_BRAVERY: u64 = 1 << 6;
		///User is part of HypeSquad Brilliance.
		const HOUSE_BRILLIANCE: u64 = 1 << 7;
		///User is a part of HypeSquad Balance.
		const HOUSE_BALANCE: u64 = 1 << 8;

		///User is an Early Supporter.
		const PREMIUM_EARLY_SUPPORTER: u64 = 1 << 9;
		///Account is a Team account.
		const TEAM_PSEUDO_USER: u64 = 1 << 10;
		///Account is a Discord system account.
		const SYSTEM: u64 = 1 << 12;
		///User is a verified bot.
		const VERIFIED_BOT: u64 = 1 << 16;
		///User is a verified bot developer.
		const VERIFIED_BOT_DEVELOPER: u64 = 1 << 17;
		///User is a Discord certified moderator alum.
		const CERTIFIED_MODERATOR: u64 = 1 << 18;
	}
	pub mod other {
		///Account has been deleted.
		const DELETED: u64 = 1 << 34;
		///User is currently temporarily or permanently disabled.
		const DISABLED: u64 = 1 << 41;
	}
}
