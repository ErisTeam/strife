// Serde stuff, if you need more info you can check it
// out here: <https://serde.rs/enum-representations.html>.
//
// It's used here to make matching easier.
use serde::{ Deserialize, Serialize };

use crate::modules::auth;
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
#[serde(rename_all = "camelCase")]
pub enum Auth {
	LoginSuccess {
		user_id: String,
		user_settings: Option<auth::UserSettings>,
	},
	RequireAuth {
		captcha_key: Option<Vec<String>>,
		captcha_sitekey: Option<String>,
		captcha_service: Option<String>,
		mfa: Option<bool>,
		sms: Option<bool>,
	},

	Error {
		code: u64,
		errors: auth::err,
		message: String,
	},
	MobileAuthError {
		error: String,
	},
	MobileTicketData {
		user_id: String,
		discriminator: String,

		avatar_hash: String,
		username: String,
	},
	RequireAuthMobile {
		captcha_key: Option<Vec<String>>,
		captcha_sitekey: Option<String>,
		captcha_service: Option<String>,
	},
	MobileQrcode {
		qrcode: Option<String>,
	},
}
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
#[serde(rename_all = "camelCase")]
pub enum MFA {
	SmsSendingResult {
		success: bool,
		message: String,
	},
	VerifyError {
		message: String,
	},
	VerifySuccess {
		user_id: String,
		user_settings: auth::UserSettings,
	},
}

/// # Information
/// TODO
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type", content = "data")]
#[serde(rename_all = "camelCase")]
pub enum Gateway {
	MessageCreate {
		#[serde(flatten)]
		message: crate::discord::types::message::Message,
		member: crate::discord::types::guild::GuildMember,
		guild_id: String,
		mentions: Vec<crate::discord::types::guild::GuildMember>,
	},
	MessageUpdate {
		#[serde(flatten)]
		message: crate::discord::types::message::Message,
		member: crate::discord::types::guild::GuildMember,
		guild_id: String,
		mentions: Vec<crate::discord::types::guild::GuildMember>,
	},
	Error {
		message: String,
	},
}
#[derive(Serialize, Debug, Clone)]
pub struct GatewayEvent {
	#[serde(flatten)]
	pub event: Gateway,
	pub user_id: String,
}