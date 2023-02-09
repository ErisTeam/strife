use std::os;

use serde::{ Deserialize, Serialize };

/// # Information
/// TODO
#[derive(Serialize, Deserialize)]
#[serde(tag = "op")]
pub enum MobileAuthGatewayPackets {
	/// # Information
	/// TODO
	#[serde(rename = "heartbeat")]
	Heartbeat {},

	/// # Information
	/// TODO
	#[serde(rename = "heartbeat_ack")]
	HeartbeatAck {},

	/// # Information
	/// TODO
	#[serde(rename = "hello")]
	Hello {
		heartbeat_interval: u64,
		timeout_ms: u64,
	},

	/// # Information
	/// TODO
	#[serde(rename = "init")]
	Init {
		encoded_public_key: String,
	},

	/// # Information
	/// TODO
	#[serde(rename = "nonce_proof")]
	NonceProofServer {
		encrypted_nonce: String,
	},

	/// # Information
	/// TODO
	#[serde(rename = "nonce_proof")]
	NonceProofClient {
		proof: String,
	},

	/// # Information
	/// TODO
	#[serde(rename = "pending_remote_init")]
	PendingRemoteInit {
		fingerprint: String,
	},

	/// # Information
	/// TODO
	#[serde(rename = "pending_ticket")]
	PendingTicket {
		encrypted_user_payload: String,
	},

	/// # Information
	/// TODO
	#[serde(rename = "pending_login")]
	PendingLogin {
		ticket: String,
	},

	/// # Information
	/// TODO
	#[serde(rename = "cancel")]
	Cancel {},
}

/// # Information
/// TODO
#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "op")]
pub enum GatewayPackets {
	/// # Information
	/// TODO
	#[serde(rename = "heartbeat")]
	Heartbeat {
		d: u64,
	},

	/// # Information
	/// TODO
	#[serde(rename = "heartbeat")]
	HeartbeatNull {},

	/// # Information
	/// TODO
	#[serde(rename = "heartbeat_ack")]
	HeartbeatAck {},

	#[serde(rename = "2")] Identify {
		d: InitData,
	},
}
#[derive(Serialize, Deserialize, Debug)]
pub struct InitData {
	pub token: String,
	pub capabilities: u64,
	pub properties: Properties,
	pub presence: Presence,
	pub compress: bool,
	pub client_state: ClientState,
	//pub encoding: String,
}
#[derive(Serialize, Deserialize, Debug)]
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

#[derive(Serialize, Deserialize, Debug)]
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

#[derive(Serialize, Deserialize, Debug)]
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