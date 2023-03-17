use serde::{ Serialize, Deserialize };

use crate::discord::user::{ PublicUser, CurrentUser };

use super::guild::Guild;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ClientState {
	#[serde(skip_serializing_if = "Option::is_none")]
	pub guild_versions: Option<serde_json::Value>,
	pub highest_last_message_id: String,
	pub read_state_version: i64,
	pub user_guild_settings_version: i64,
	pub user_settings_version: i64,
	pub private_channels_version: String,
	pub api_code_version: i64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Presence {
	pub status: String,
	pub since: u64,
	pub activities: Vec<serde_json::Value>,
	pub afk: bool,
}
impl Default for Presence {
	fn default() -> Self {
		Self {
			since: 0,
			status: "unknown".to_string(),
			activities: Vec::new(),
			afk: false,
		}
	}
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Properties {
	pub os: String,
	pub browser: String,
	pub device: String,
	pub system_locale: String,
	pub browser_user_agent: String,
	pub browser_version: String,
	pub os_version: String,
}

impl Default for Properties {
	fn default() -> Self {
		Self {
			os: "Windows".to_string(),
			browser: "Chrome".to_string(),
			device: String::new(),
			system_locale: "?".to_string(),
			browser_user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36".to_string(),
			browser_version: "91.0.4472.124".to_string(),
			os_version: "10".to_string(),
		}
	}
}

#[derive(Deserialize, Debug)]
pub struct SessionReplaceData {
	status: String,
	session_id: String,
	client_info: serde_json::Value,
	activities: Vec<serde_json::Value>,
}

#[derive(Deserialize, Debug)]
pub struct ReadyData {
	pub v: u64,

	pub users: Vec<PublicUser>,

	pub user: CurrentUser,

	pub guilds: Vec<Guild>,
	pub relationships: Vec<serde_json::Value>,

	pub resume_gateway_url: String,
	pub session_id: String,
}