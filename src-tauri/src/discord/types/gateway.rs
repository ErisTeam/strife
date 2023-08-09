use std::collections::HashMap;

use base64::Engine;
use serde::{ Deserialize, Serialize };

use crate::Result;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ClientState {
	pub guild_versions: HashMap<String, serde_json::Value>,
	pub highest_last_message_id: String,
	pub read_state_version: i64,
	pub user_guild_settings_version: i64,
	pub user_settings_version: i64,
	pub private_channels_version: String,
	pub api_code_version: i64,
}
impl Default for ClientState {
	fn default() -> Self {
		Self {
			guild_versions: HashMap::new(),
			highest_last_message_id: "0".to_string(),
			read_state_version: 0,
			user_guild_settings_version: -1,
			user_settings_version: -1,
			private_channels_version: "0".to_string(),
			api_code_version: 0,
		}
	}
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
impl Properties {
	pub fn base64(&self) -> Result<String> {
		Ok(base64::engine::general_purpose::STANDARD.encode(serde_json::to_vec(&self)?))
	}
}
impl Default for Properties {
	fn default() -> Self {
		Self {
			os: "Windows".to_string(),
			browser: "TNADC".to_string(), //or Discord Client
			device: String::new(),
			system_locale: "en-US".to_string(),
			browser_user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36".to_string(),
			browser_version: "91.0.4472.124".to_string(),
			os_version: "10".to_string(),
		}
	}
}

#[derive(Deserialize, Debug)]
pub struct ReadState {
	pub version: i64,
	pub partial: bool,
	pub entries: Vec<serde_json::Value>,
}

#[derive(Deserialize, Debug)]
pub struct ReadStateEntries {
	pub id: String,
	pub last_message_id: String,
	pub mention_count: i64,
	pub last_pin_timestamp: String,
}

#[derive(Deserialize, Debug)]
pub struct SessionReplaceData {
	status: String,
	session_id: String,
	client_info: serde_json::Value,
	activities: Vec<serde_json::Value>,
}
pub mod gateway_packets_data {
	use serde::{ Deserialize, Serialize };

	use crate::discord::types::{
		guild::{ GuildMember, PartialGuild },
		message::Message,
		user::{ PublicUser, CurrentUser, GuildSettings },
		relationship::GatewayRelationship,
	};

	use super::{ Properties, Presence, ClientState, ReadState };

	#[derive(Deserialize, Debug)]
	pub struct ReadySupplemental {
		merged_presences: serde_json::Value,
		merged_members: serde_json::Value,
		lazy_private_channels: serde_json::Value,
		guilds: serde_json::Value,
	}

	#[derive(Deserialize, Debug, Serialize, Clone)]
	pub struct MessageEvent {
		#[serde(flatten)]
		pub message: Message,
		pub mentions: Vec<GuildMember>,

		pub member: GuildMember,

		pub guild_id: String,
	}
	#[derive(Deserialize, Debug)]
	pub struct MessageDelete {
		pub id: String,
		pub channel_id: String,
		pub guild_id: Option<String>,
	}

	#[derive(Deserialize, Debug)]
	pub struct Hello {
		pub heartbeat_interval: u64,
	}

	#[derive(Deserialize, Debug)]
	pub struct TypingStart {
		pub user_id: String,
		pub timestamp: u64,
		pub member: GuildMember,
		pub channel_id: String,
		pub guild_id: String,
	}

	#[derive(Deserialize, Serialize, Debug)]
	pub struct Heartbeat {
		#[serde(rename = "d")]
		pub sequence_number: Option<u64>,
	}

	#[derive(Serialize, Debug, Clone)]
	pub struct LazyGuilds {
		pub guild_id: String,
		pub channels: Vec<serde_json::Value>,
		pub members: bool,
		pub threads: bool,
		pub activities: bool,
		pub typing: bool,
	}

	#[derive(Serialize, Debug, Clone)]
	pub struct Resume {
		pub token: String,
		pub session_id: String,
		#[serde(rename = "seq")]
		pub last_seq: u64,
	}

	#[derive(Serialize, Debug, Clone)]
	pub struct VoiceStateUpdateSend {
		pub guild_id: String,
		pub channel_id: String,
		pub self_mute: bool,
		pub self_deaf: bool,
	}
	impl Default for VoiceStateUpdateSend {
		fn default() -> Self {
			Self {
				guild_id: String::new(),
				channel_id: String::new(),
				self_mute: false,
				self_deaf: false,
			}
		}
	}
	#[derive(Deserialize, Serialize, Debug, Clone)]
	pub struct VoiceStateUpdate {
		guild_id: Option<String>,
		channel_id: Option<String>,
		user_id: String,
		member: Option<GuildMember>,
		session_id: Option<String>,
		deaf: bool,
		mute: bool,
		self_deaf: bool,
		self_mute: bool,
		self_stream: Option<bool>,
		self_video: bool,
		suppress: bool,
		request_to_speak_timestamp: Option<String>,
	}

	#[derive(Deserialize, Debug, Clone)]
	struct VoiceState {
		guild_id: Option<String>,
		channel_id: Option<String>,
		user_id: String,

		member: Option<GuildMember>,

		session_id: String,
		deaf: bool,
		mute: bool,
		self_deaf: bool,
		self_mute: bool,
		self_stream: Option<bool>,
		self_video: bool,
		suppress: bool,
		request_to_speak_timestamp: Option<String>,
	}

	#[derive(Deserialize, Serialize, Debug, Clone)]
	pub struct VoiceServerUpdate {
		pub token: String,
		pub guild_id: String,
		pub endpoint: String,
	}

	#[derive(Serialize, Debug)]
	pub struct Identify {
		pub token: String,
		pub capabilities: u64,
		pub properties: Properties,
		pub presence: Presence,
		pub compress: bool,
		pub client_state: ClientState,
	}
	impl Default for Identify {
		fn default() -> Self {
			Self {
				token: String::new(),
				capabilities: Self::default_capabilities(),
				properties: Properties::default(),
				presence: Presence::default(),
				compress: false,
				client_state: ClientState::default(),
			}
		}
	}
	impl Identify {
		pub fn default_capabilities() -> u64 {
			16381
		}
	}
	#[derive(Deserialize, Debug)]
	pub struct Ready {
		pub v: u64,

		pub users: Vec<PublicUser>,

		pub user: CurrentUser,
		pub user_settings_proto: String, //TODO: decode using protobuf

		pub user_guild_settings: GuildSettings,
		pub guilds: Vec<PartialGuild>,
		pub relationships: Vec<GatewayRelationship>,

		pub resume_gateway_url: String,

		pub sessions: Vec<serde_json::Value>,
		pub session_type: String,
		pub session_id: String,

		pub tutorial: Option<serde_json::Value>,

		pub read_state: ReadState,

		pub guild_join_requests: Vec<serde_json::Value>,

		//guild_experiments: Vec<serde_json::Value>,
		pub geo_ordered_rtc_regions: Vec<String>,

		pub friend_suggestion_count: u64,

		//experiments: Vec<serde_json::Value>,
		pub country_code: String,

		pub consents: serde_json::Value,

		pub connected_accounts: Vec<serde_json::Value>,

		pub auth_session_id_hash: String,

		pub api_code_version: u64,

		pub analytics_token: String,

		pub private_channels: Vec<serde_json::Value>,
	}
}
pub mod voice_gateway_packets_data {
	use serde::{ Deserialize, Serialize };

	#[derive(Deserialize, Debug)]
	pub struct Hello {
		pub heartbeat_interval: u64,
	}

	#[derive(Serialize, Debug)]
	pub struct Identify {
		#[serde(rename = "server_id")]
		pub guild_id: String,
		pub user_id: String,
		pub session_id: String,
		#[serde(rename = "token")]
		pub voice_token: String,
	}

	#[derive(Deserialize, Serialize, Debug, Clone)]
	pub struct Ready {
		ssrc: u64,
		ip: String,
		port: u64,
		modes: Vec<String>,
		experiments: Vec<String>,
	}

	#[derive(Serialize, Debug)]
	pub struct Heartbeat {
		pub nonce: u64,
	}
	#[derive(Deserialize, Debug)]
	pub struct HeartbeatAck {
		nonce: u64,
	}
	#[derive(Serialize, Debug)]
	pub struct SelectProtocol {
		protocol: Protocol,
		data: SelectProtocolData,
	}

	#[derive(Serialize, Debug)]
	#[serde(rename_all = "lowercase")]
	enum Protocol {
		Udp,
		Webrtc,
	}

	#[derive(Serialize, Debug)]
	pub struct SelectProtocolData {}

	#[derive(Deserialize, Debug)]
	pub struct UserInfo {
		user_id: String,
		flags: u64,
	}
	#[derive(Deserialize, Debug)]
	pub struct UserInfo2 {
		user_id: String,
		platform: u64,
	}
}
