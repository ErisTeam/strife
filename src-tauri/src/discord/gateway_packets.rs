use serde::{ Deserialize, Serialize };
use serde_repr::{ Deserialize_repr };

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
#[derive(Deserialize, Debug, Clone)]
//#[serde(tag = "op", content = "d")]
#[serde(untagged)]
pub enum GatewayPackets {
	/// # Information
	/// TODO
	Heartbeat {
		d: Option<u64>,
	},

	Identify {
		token: String,
		capabilities: u64,
		properties: Properties,
		presence: Presence,
		compress: bool,
		client_state: ClientState,
	},
}

impl Serialize for GatewayPackets {
	fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: serde::Serializer {
		#[derive(Serialize)]
		#[serde(untagged)]
		enum GatewayPackets_ {
			Identify {
				token: String,
				capabilities: u64,
				properties: Properties,
				presence: Presence,
				compress: bool,
				client_state: ClientState,
			},
			Heartbeat {
				d: Option<u64>,
			},
		}
		#[derive(Serialize)]
		struct TypedGatewayPackets {
			#[serde(rename = "op")]
			t: u64,

			d: GatewayPackets_,
		}
		let msg = match &self {
			GatewayPackets::Heartbeat { d } =>
				TypedGatewayPackets {
					t: 1,
					d: GatewayPackets_::Heartbeat {
						d: *d,
					},
				},

			GatewayPackets::Identify {
				token,
				capabilities,
				properties,
				presence,
				compress,
				client_state,
			} =>
				TypedGatewayPackets {
					t: 2,
					d: GatewayPackets_::Identify {
						token: token.clone(),
						capabilities: capabilities.clone(),
						properties: properties.clone(),
						presence: presence.clone(),
						compress: compress.clone(),
						client_state: client_state.clone(),
					},
				},
		};

		msg.serialize(serializer)
	}
}

#[derive(Debug)]
pub struct GatewayIncomingPacket {
	pub s: Option<u64>,
	pub op: DataType,
	pub d: GatewayPacketsData,
}
impl<'de> Deserialize<'de> for GatewayIncomingPacket {
	fn deserialize<D>(deserializer: D) -> Result<Self, D::Error> where D: serde::Deserializer<'de> {
		#[derive(Deserialize)]
		struct DataInner {
			op: DataType,
			s: Option<u64>,
			d: serde_json::Value,
		}
		let data = DataInner::deserialize(deserializer)?;

		let payload = GatewayPacketsData::deserialize(data.d);

		Ok(GatewayIncomingPacket {
			s: data.s,
			op: data.op,
			d: payload.unwrap(),
		})
	}
}

#[derive(Clone, Debug, PartialEq, Eq, Deserialize_repr)]
#[repr(u8)]
pub enum DataType {
	Hello = 10,
	HeartbeatAck = 11,
	Ready = 0,
}
#[derive(Deserialize, Debug)]
#[serde(untagged)]
pub enum GatewayPacketsData {
	Hello {
		heartbeat_interval: u64,
	},

	Ready {
		v: u64,
		users: Vec<serde_json::Value>,
		resume_gateway_url: String,
	},
	HeartbeatAck {},
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