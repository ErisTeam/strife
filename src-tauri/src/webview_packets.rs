// Serde stuff, if you need more info you can check it
// out here: <https://serde.rs/enum-representations.html>.
//
// It's used here to make matching easier.
use serde::{ Deserialize, Serialize };

use crate::discord::types::{ guild::PartialGuild, gateway::packets_data::MessageEvent, user::CurrentUser };
pub mod auth {
	use serde::{ Deserialize, Serialize };

	use crate::{ discord::http_packets::auth::ErrorTypes, token_utils };
	#[derive(Serialize, Deserialize, Debug, Clone)]
	#[serde(tag = "type")]
	#[serde(rename_all = "camelCase")]
	pub enum Auth {
		#[serde(rename_all = "camelCase")] LoginSuccess {
			user_id: String,
			user_settings: Option<crate::modules::auth::UserSettings>,
		},
		#[serde(rename_all = "camelCase")] RequireAuth {
			captcha_key: Option<Vec<String>>,
			captcha_sitekey: Option<String>,
			captcha_service: Option<String>,
			mfa: Option<bool>,
			sms: Option<bool>,
			remote_auth: bool,
		},

		#[serde(rename_all = "camelCase")] Error {
			code: u64,
			errors: ErrorTypes,
			message: String,
		},
		MobileAuthError {
			error: String,
		},
		#[serde(rename_all = "camelCase")] MobileTicketData {
			user_id: String,
			discriminator: String,

			avatar_hash: String,
			username: String,
		},
		#[serde(rename_all = "camelCase")] RequireAuthMobile {
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
			user_settings: crate::modules::auth::UserSettings,
		},
	}
	impl From<crate::modules::auth::MFAResponse> for MFA {
		fn from(value: crate::modules::auth::MFAResponse) -> Self {
			match value {
				crate::modules::auth::MFAResponse::Success { token, user_settings } =>
					Self::VerifySuccess { user_id: token_utils::get_id(&token).unwrap(), user_settings },
				crate::modules::auth::MFAResponse::Error { message, .. } => Self::VerifyError { message },
			}
		}
	}
}

/// # Information
/// TODO
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type", content = "data")]
#[serde(rename_all = "camelCase")]
pub enum Gateway {
	MessageCreate(MessageEvent),

	UserInfo(CurrentUser),

	MessageUpdate(MessageEvent),
	Error {
		message: String,
	},
	Started,
}
#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GatewayEvent<T: Serialize + core::fmt::Debug + Clone> {
	#[serde(flatten)]
	pub event: T,
	pub user_id: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type", content = "data")]
#[serde(rename_all = "camelCase")]
pub enum General {
	UserData {
		user: Box<crate::discord::types::user::CurrentUser>,
		users: Vec<crate::discord::types::user::PublicUser>,
	},
	Relationships {
		relationships: Vec<crate::discord::types::relationship::Relationship>,
	},

	Guilds {
		guilds: Vec<PartialGuild>,
	},
	GuildCreate {
		guild: PartialGuild,
	},
	Error {
		_for: String,
		message: String,
	},
}
