use serde::{ Deserialize, Serialize };
use serde_repr::{ Deserialize_repr };

use super::types::{
	message::Message,
	guild::GuildMember,
	voice::VoiceState,
	gateway::{ SessionReplaceData, Properties, ClientState, Presence, ReadyData },
};

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

	Resume {
		token: String,
		session_id: String,
		seq: u64,
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
			Resume {
				token: String,
				session_id: String,
				seq: u64,
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
			GatewayPackets::Identify { token, capabilities, properties, presence, compress, client_state } =>
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
			GatewayPackets::Resume { token, session_id, seq } =>
				TypedGatewayPackets {
					t: 7,
					d: GatewayPackets_::Resume { token: token.clone(), session_id: session_id.clone(), seq: *seq },
				},
		};

		msg.serialize(serializer)
	}
}

#[derive(Debug)]
pub struct GatewayIncomingPacket {
	pub s: Option<u64>,
	pub t: Option<String>,
	pub op: DataType,
	pub d: GatewayPacketsData,
}
impl<'de> Deserialize<'de> for GatewayIncomingPacket {
	fn deserialize<D>(deserializer: D) -> Result<Self, D::Error> where D: serde::Deserializer<'de> {
		#[derive(Deserialize)]
		struct DataInner {
			op: DataType,
			t: Option<String>,
			s: Option<u64>,
			d: serde_json::Value,
		}
		let data = DataInner::deserialize(deserializer)?;
		let payload;
		if data.op == DataType::HeartbeatAck {
			payload = GatewayPacketsData::HeartbeatAck {};
		} else {
			payload = GatewayPacketsData::deserialize(data.d).unwrap();
		}

		Ok(GatewayIncomingPacket {
			s: data.s,
			op: data.op,
			t: data.t,
			d: payload,
		})
	}
}

#[derive(Clone, Debug, PartialEq, Eq, Deserialize_repr)]
#[repr(u8)]
pub enum DataType {
	Hello = 10,
	HeartbeatAck = 11,
	Dispatch = 0,
}
#[derive(Deserialize, Debug)]
#[serde(untagged)]
pub enum GatewayPacketsData {
	Hello {
		heartbeat_interval: u64,
	},
	HeartbeatAck,

	Ready(ReadyData),
	ReadySupplemental {
		merged_presences: serde_json::Value,
		merged_members: serde_json::Value,
		lazy_private_channels: serde_json::Value,
		guilds: serde_json::Value,
	},
	///
	/// # example
	/// ```json
	///[
	///    {
	///        "status": "online",
	///        "session_id": "",
	///        "client_info": {
	///            "version": 0,
	///            "os": "windows",
	///            "client": "web"
	///        },
	///        "activities": []
	///    }
	///]
	/// ```
	SessionReplace(Vec<SessionReplaceData>),

	//MessageCreate/MessageUpdate
	MessageEvent {
		#[serde(flatten)]
		message: Message,
		mentions: Vec<GuildMember>,

		member: GuildMember,

		guild_id: String,
	},
	MessageDelete {
		id: String,
		channel_id: String,
		guild_id: Option<String>,
	},

	TypingStart {
		user_id: String,
		timestamp: u64,
		member: GuildMember,
		channel_id: String,
		guild_id: String,
	},

	VoiceStateUpdate(VoiceState),

	Unknown {},
}