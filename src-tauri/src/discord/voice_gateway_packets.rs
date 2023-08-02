use serde::{ Deserialize, Serialize };
use serde_repr::Deserialize_repr;

use super::types::gateway::voice_gateway_packets_data::{
	Ready,
	Hello,
	Identify,
	Heartbeat,
	HeartbeatAck,
	SelectProtocol,
	UserInfo,
	UserInfo2,
};
#[derive(Serialize, Debug)]
#[serde(untagged)]
pub enum OutGoingPacketsData {
	///Begin a voice websocket connection.
	///opcode: `0`
	Identify(Identify),

	///Indicate which users are speaking.
	///opcode: `5`
	Speaking(),
	///Keep the websocket connection alive.
	///opcode: `3``
	Heartbeat(Heartbeat),

	///Select the voice protocol.
	/// opcode: `1`
	SelectProtocol(SelectProtocol),

	/// payload: {}
	/// opcode: `16`
	Undocumented {},
}

#[derive(Serialize, Debug)]
pub struct OutGoingPacket {
	op: u8,
	d: OutGoingPacketsData,
}

impl OutGoingPacket {
	pub fn new(d: OutGoingPacketsData) -> crate::Result<Self> {
		let op_code = match d {
			OutGoingPacketsData::Identify(_) => 0,
			OutGoingPacketsData::Speaking() => 5,
			OutGoingPacketsData::Heartbeat(_) => 3,
			OutGoingPacketsData::Undocumented {} => 16,
			OutGoingPacketsData::SelectProtocol(_) => 1,
			_ => {
				return Err("Invalid OutGoingPacketsData".into());
			}
		};
		Ok(Self {
			op: op_code,
			d,
		})
	}
}

#[derive(Debug)]
pub enum IncomingPacketsData {
	///Complete the websocket handshake.
	/// opcode: `2`
	Ready(Ready),
	///Describe the session.
	/// opcode: `4`
	SessionDescription(),
	///Indicate which users are speaking.
	/// opcode: `5`
	Speaking(),
	///Sent to acknowledge a received client heartbeat.
	/// opcode: `6`
	HeartbeatAck(HeartbeatAck),
	///Time to wait between sending heartbeats in milliseconds.
	/// opcode: `8`
	Hello(Hello),
	///Acknowledge a successful session resume.
	/// opcode: `9`
	Resumed(),
	///A client has disconnected from the voice channel
	/// opcode: `13`
	ClientDisconnect(),

	/// user info
	/// opcode: `18`
	UserInfo(UserInfo),

	/// user info
	/// opcode: `20`
	UserInfoPlatform(UserInfo2),

	Unknown(serde_json::Value),
}
impl ToString for IncomingPacketsData {
	fn to_string(&self) -> String {
		match self {
			IncomingPacketsData::Ready(_) => "Ready".to_string(),
			IncomingPacketsData::SessionDescription() => "SessionDescription".to_string(),
			IncomingPacketsData::Speaking() => "Speaking".to_string(),
			IncomingPacketsData::HeartbeatAck(_) => "HeartbeatAck".to_string(),
			IncomingPacketsData::Hello(_) => "Hello".to_string(),
			IncomingPacketsData::Resumed() => "Resumed".to_string(),
			IncomingPacketsData::ClientDisconnect() => "ClientDisconnect".to_string(),
			IncomingPacketsData::Unknown(_) => "Unknown".to_string(),
			IncomingPacketsData::UserInfo(_) => "UserInfo".to_string(),
			IncomingPacketsData::UserInfoPlatform(_) => "UserInfoPlatform".to_string(),
		}
	}
}

#[derive(Clone, Debug, PartialEq, Eq, Deserialize_repr)]
#[repr(u8)]
///Source: https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice
pub enum OpCode {
	///Complete the websocket handshake.
	Ready = 2,

	///Describe the session.
	SessionDescription = 4,

	///Indicate which users are speaking.
	Speaking = 5,

	///Sent to acknowledge a received client heartbeat.
	HeartbeatAck = 6,

	///Time to wait between sending heartbeats in milliseconds.
	Hello = 8,

	///Acknowledge a successful session resume.
	Resumed = 9,

	///A client has disconnected from the voice channel
	ClientDisconnect = 13,

	/// example payload: {"voice": "0.9.5","rtc_worker": "0.3.43"}
	/// opcode: `16`
	Undocumented = 16,

	/// example payload: {any:100}
	/// opcode: `15`
	Undocumented2 = 15,

	/// user info
	/// opcode: `18`
	UserInfo = 18,

	/// user info platform
	/// opcode: `20`
	UserInfoPlatform = 20,
}

#[derive(Debug)]
pub struct IncomingPacket {
	pub op_code: OpCode,
	pub data: IncomingPacketsData,
}
impl<'de> Deserialize<'de> for IncomingPacket {
	fn deserialize<D>(deserializer: D) -> Result<Self, D::Error> where D: serde::Deserializer<'de> {
		#[derive(Deserialize)]
		struct DataInner {
			///opcode
			op: OpCode,
			///event data
			d: serde_json::Value,
		}
		let inner = DataInner::deserialize(deserializer)?;
		let packet_data = match inner.op {
			OpCode::Ready =>
				IncomingPacketsData::Ready(serde_json::from_value(inner.d).map_err(serde::de::Error::custom)?),
			OpCode::SessionDescription => IncomingPacketsData::Unknown(inner.d),
			OpCode::Speaking => IncomingPacketsData::Unknown(inner.d),
			OpCode::HeartbeatAck =>
				IncomingPacketsData::HeartbeatAck(serde_json::from_value(inner.d).map_err(serde::de::Error::custom)?),
			OpCode::Hello =>
				IncomingPacketsData::Hello(serde_json::from_value(inner.d).map_err(serde::de::Error::custom)?),
			OpCode::Resumed => todo!("Resumed"),
			OpCode::ClientDisconnect => todo!("ClientDisconnect"),
			OpCode::Undocumented => todo!(),
			OpCode::Undocumented2 => IncomingPacketsData::Unknown(inner.d),
			OpCode::UserInfo =>
				IncomingPacketsData::UserInfo(serde_json::from_value(inner.d).map_err(serde::de::Error::custom)?),
			OpCode::UserInfoPlatform =>
				IncomingPacketsData::UserInfoPlatform(
					serde_json::from_value(inner.d).map_err(serde::de::Error::custom)?
				),
		};
		Ok(Self {
			op_code: inner.op,
			data: packet_data,
		})
	}
}
