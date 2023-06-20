use log::debug;
use serde::{ Deserialize, Serialize };
use serde_repr::Deserialize_repr;

use super::types::{
	gateway::{
		ClientState,
		Presence,
		Properties,
		packets_data::{ Ready, Heartbeat, Identify, MessageEvent, MessageDelete, Hello, TypingStart },
		SessionReplaceData,
	},
	guild::GuildMember,
	message::Message,
	voice::VoiceState,
};

/// # Information
/// TODO
#[derive(Deserialize, Debug, Clone)]
//#[serde(tag = "op", content = "d")]
#[serde(untagged)]
#[deprecated]
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
	UpdatePresence {
		since: Option<u64>,
		activities: Vec<serde_json::Value>,
		status: String, //TODO: replace with enum
		afk: bool,
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
			UpdatePresence {
				since: Option<u64>,
				activities: Vec<serde_json::Value>,
				status: String, //TODO: replace with enum
				afk: bool,
			},
		}
		#[derive(Serialize)]
		struct TypedGatewayPackets {
			op: u64,

			d: GatewayPackets_,
		}
		let msg = match self.clone() {
			GatewayPackets::Heartbeat { d } =>
				TypedGatewayPackets {
					op: 1,
					d: GatewayPackets_::Heartbeat { d: d },
				},
			GatewayPackets::Identify { token, capabilities, properties, presence, compress, client_state } =>
				TypedGatewayPackets {
					op: 2,
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
					op: 7,
					d: GatewayPackets_::Resume {
						token: token.clone(),
						session_id: session_id.clone(),
						seq: seq,
					},
				},
			GatewayPackets::UpdatePresence { since, activities, status, afk } =>
				TypedGatewayPackets {
					op: 3,
					d: GatewayPackets_::UpdatePresence {
						since,
						activities,
						status,
						afk,
					},
				},
		};

		msg.serialize(serializer)
	}
}

#[derive(Debug)]
#[deprecated]
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
#[deprecated]
pub enum DataType {
	Hello = 10,
	HeartbeatAck = 11,
	Dispatch = 0,
}
#[derive(Deserialize, Debug)]
#[serde(untagged)]
#[deprecated]
pub enum GatewayPacketsData {
	Hello {
		heartbeat_interval: u64,
	},
	HeartbeatAck,

	Ready(Ready),
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
	Unknown(serde_json::Value),
}
impl GatewayPacketsData {
	pub fn get_name(&self) -> &'static str {
		match self {
			GatewayPacketsData::Hello { .. } => {
				return "Hello";
			}
			GatewayPacketsData::HeartbeatAck => {
				return "HeartbeatAck";
			}
			GatewayPacketsData::Ready(_) => {
				return "Ready";
			}
			GatewayPacketsData::ReadySupplemental { .. } => {
				return "ReadySupplemental";
			}
			GatewayPacketsData::SessionReplace(..) => {
				return "SessionReplace";
			}
			GatewayPacketsData::MessageEvent { .. } => {
				return "MessageEvent";
			}
			GatewayPacketsData::MessageDelete { .. } => {
				return "MessageDelete";
			}
			GatewayPacketsData::TypingStart { .. } => {
				return "TypingStart";
			}
			GatewayPacketsData::VoiceStateUpdate(_) => {
				return "VoiceStateUpdate";
			}
			_ => {
				return "Unknown";
			}
		}
	}
}

#[derive(Serialize, Debug)]
pub enum OutGoingPacketsData {
	/// Fired periodically by the client to keep the connection alive.
	/// opcode: `1`
	Heartbeat(Heartbeat),
	///Starts a new session during the initial handshake.
	/// opcode: `2`
	Identify(Identify),
}
#[derive(Serialize, Debug)]
pub struct OutGoingPacket {
	op: u64,
	d: OutGoingPacketsData,
}
impl OutGoingPacket {
	#[allow(unreachable_patterns)]
	pub fn new(d: OutGoingPacketsData) -> crate::Result<Self> {
		let op_code = match d {
			OutGoingPacketsData::Heartbeat(_) => 1,
			OutGoingPacketsData::Identify(_) => 2,
			_ => {
				return Err("Invalid OutGoingPacketsData".into());
			}
		};
		Ok(Self { op: op_code, d })
	}
}

#[derive(Debug)]
pub enum IncomingPacketsData {
	Hello(Hello),
	/// Discord documentation states that this send and received by client
	/// opcode: `1`
	Heartbeat(Heartbeat),
	///Sent in response to receiving a heartbeat to acknowledge that it has been received.
	/// opcode: `11`
	HeartbeatAck,

	///TODO: Description
	/// opcode: `0`
	Ready(Ready),

	///TODO: Description
	/// opcode: `0`
	SessionReplace(Vec<SessionReplaceData>),

	///Sent when message is created or updated
	/// opcode: `0`
	MessageEvent(MessageEvent),

	///Sent when message is deleted
	/// opcode: `0`
	MessageDelete(MessageDelete),

	///Sent when user starts typing
	/// opcode: `0`
	StartTyping(TypingStart),

	///Fallback for unknown packets
	/// opcode: `?`
	Unknown(serde_json::Value),
}

#[derive(Clone, Debug, PartialEq, Eq, Deserialize_repr)]
#[repr(u8)]
///Source: https://discord.com/developers/docs/topics/opcodes-and-status-codes#opcodes-and-status-codes
pub enum OpCode {
	///An event was dispatched.
	Dispatch = 0,
	///Fired periodically by the client to keep the connection alive.
	Heartbeat = 1,
	///Starts a new session during the initial handshake.
	Identify = 2,
	///Update the client's presence.
	PresenceUpdate = 3,
	//Used to join/leave or move between voice channels.
	VoiceStateUpdate = 4,
	///Resume a previous session that was disconnected.
	Resume = 5,
	///You should attempt to reconnect and resume immediately.
	Reconnect = 6,
	///Request information about offline guild members in a large guild.
	RequestGuildMembers = 8,
	///The session has been invalidated. You should reconnect and identify/resume accordingly.
	InvalidSession = 9,
	///Sent immediately after connecting, contains the `heartbeat_interval` to use.
	Hello = 10,
	///Sent in response to receiving a heartbeat to acknowledge that it has been received.
	HeartbeatAck = 11,
}

#[derive(Debug)]
pub struct IncomingPacket {
	payload_type: Option<String>,
	sequence_number: Option<u64>,
	op_code: OpCode,
	data: IncomingPacketsData,
}
impl<'de> Deserialize<'de> for IncomingPacket {
	fn deserialize<D>(deserializer: D) -> Result<Self, D::Error> where D: serde::Deserializer<'de> {
		#[derive(Deserialize)]
		struct DataInner {
			///opcode
			op: OpCode,
			///sequence number, used for resuming sessions and heartbeats
			s: Option<u64>,
			///event name
			t: Option<String>,
			///event data
			d: serde_json::Value,
		}
		let inner = DataInner::deserialize(deserializer)?;
		let packet_data = match inner.op {
			OpCode::Dispatch => {
				if let Some(t) = &inner.t {
					match t.as_str() {
						"READY" =>
							IncomingPacketsData::Ready(
								serde_json
									::from_value(inner.d)
									.map_err(|x|
										serde::de::Error::custom(
											format!("Error While deserializng Ready Packet {:?}", x)
										)
									)?
							),
						"SESSIONS_REPLACE" =>
							IncomingPacketsData::SessionReplace(
								serde_json
									::from_value(inner.d)
									.map_err(|x|
										serde::de::Error::custom(
											format!("Error While deserializng SessionReplace Packet {:?}", x)
										)
									)?
							),
						"START_TYPING" =>
							IncomingPacketsData::StartTyping(
								serde_json
									::from_value(inner.d)
									.map_err(|x|
										serde::de::Error::custom(
											format!("Error While deserializng StartTyping Packet {:?}", x)
										)
									)?
							),
						"MESSAGE_DELETE" =>
							IncomingPacketsData::MessageDelete(
								serde_json
									::from_value(inner.d)
									.map_err(|x|
										serde::de::Error::custom(
											format!("Error While deserializng MessageDelete Packet{:?}", x)
										)
									)?
							),

						"MESSAGE_CREATE" | "MESSAGE_UPDATE" => {
							IncomingPacketsData::MessageEvent(
								serde_json
									::from_value(inner.d)
									.map_err(|x|
										serde::de::Error::custom(
											format!("Error While deserializng {} Packet {:?}", t, x)
										)
									)?
							)
						}
						_ => { IncomingPacketsData::Unknown(inner.d) }
					}
				} else {
					return Err(serde::de::Error::custom("Missing t field"));
				}
			}
			OpCode::Hello =>
				IncomingPacketsData::Hello(
					serde_json::from_value(inner.d).map_err(|x| serde::de::Error::custom(format!("{:?}", x)))?
				),
			OpCode::Heartbeat =>
				IncomingPacketsData::Heartbeat(
					serde_json::from_value(inner.d).map_err(|x| serde::de::Error::custom(format!("{:?}", x)))?
				),
			OpCode::HeartbeatAck => IncomingPacketsData::HeartbeatAck,
			a => {
				debug!("Unknown OpCode: {:?}", a);
				return Err(serde::de::Error::custom(format!("Unknown OpCode: {:?}", a)));
			}
		};
		Ok(IncomingPacket {
			payload_type: inner.t,
			sequence_number: inner.s,
			op_code: inner.op,
			data: packet_data,
		})
	}
}
