use log::debug;
use serde::{ Deserialize, Serialize };
use serde_repr::Deserialize_repr;

use super::types::gateway::{
	gateway_packets_data::{
		Ready,
		Heartbeat,
		Identify,
		MessageEvent,
		MessageDelete,
		Hello,
		TypingStart,
		ReadySupplemental,
		LazyGuilds,
		VoiceStateUpdateSend,
		VoiceServerUpdate,
		VoiceStateUpdate,
		Resume,
	},
	SessionReplaceData,
};

#[derive(Serialize, Debug)]
#[serde(untagged)]
pub enum OutGoingPacketsData {
	/// Fired periodically by the client to keep the connection alive.
	/// opcode: `1`
	Heartbeat(Heartbeat),
	///Starts a new session during the initial handshake.
	/// opcode: `2`
	Identify(Identify),

	///https://luna.gitlab.io/discord-unofficial-docs/lazy_guilds.html
	/// opcode: `14`
	#[allow(unused)]
	LazyGuilds(LazyGuilds),

	///Resume a previous session that was disconnected.
	/// opcode: `6`
	Resume(Resume),

	///TODO: Description
	/// opcode: `4`
	VoiceStateUpdate(VoiceStateUpdateSend),
}
#[derive(Serialize, Debug)]
pub struct OutGoingPacket {
	op: u8,
	d: OutGoingPacketsData,
}
impl OutGoingPacket {
	#[allow(unreachable_patterns)]
	pub fn new(d: OutGoingPacketsData) -> crate::Result<Self> {
		let op_code = match d {
			OutGoingPacketsData::Heartbeat(_) => 1,
			OutGoingPacketsData::Identify(_) => 2,
			OutGoingPacketsData::LazyGuilds(_) => 14,
			OutGoingPacketsData::VoiceStateUpdate(_) => 4,
			_ => {
				return Err("Invalid OutGoingPacketsData".into());
			}
		};
		Ok(Self { op: op_code, d })
	}
	//TODO: move to impl OutGoingPacketsData
	pub fn heartbeat(sequence_number: Option<u64>) -> Self {
		Self::new(OutGoingPacketsData::Heartbeat(Heartbeat { sequence_number })).unwrap()
	}
	pub fn identify(i: Identify) -> Self {
		Self::new(OutGoingPacketsData::Identify(i)).unwrap()
	}
	pub fn lazy_guilds(l: LazyGuilds) -> Self {
		Self::new(OutGoingPacketsData::LazyGuilds(l)).unwrap()
	}
	pub fn voice_state_update(v: VoiceStateUpdateSend) -> Self {
		Self::new(OutGoingPacketsData::VoiceStateUpdate(v)).unwrap()
	}

	pub fn to_json(&self) -> crate::Result<String> {
		Ok(serde_json::to_string(self)?)
	}
}
///TODO: Description
/// opcode: `0`
#[derive(Debug)]
pub enum DispatchedEvents {
	///Sent after [Identify] contains user data
	///
	/// [`Identify`]: self::OutGoingPacketsData#variant.Identify
	Ready(Ready),

	///Sent after [Ready] contains additional data
	///
	/// [`Ready`]: self::DispatchedEvents#variant.Ready
	ReadySupplemental(ReadySupplemental),

	///TODO: Description
	SessionReplace(Vec<SessionReplaceData>),

	///Sent when message is created or updated
	MessageCreate(MessageEvent),

	///Sent when message is updated
	MessageUpdate(MessageEvent),

	///Sent when message is deleted
	MessageDelete(MessageDelete),

	///Sent when user starts typing
	TypingStart(Box<TypingStart>),

	//Sent when a guild's voice server is updated. This is sent when initially connecting to voice, and when the current voice instance fails over to a new server.
	VoiceServerUpdate(VoiceServerUpdate),

	//
	VoiceStateUpdate(VoiceStateUpdate),

	///BURST_CREDIT_BALANCE_UPDATE {"replenished_today":false,"amount":2}
	BurstCreditBalanceUpdate(serde_json::Value), //TODO implement

	///Fallback for unknown packets
	Unknown(serde_json::Value),
}
impl ToString for DispatchedEvents {
	fn to_string(&self) -> String {
		match self {
			DispatchedEvents::Ready(_) => "Ready".to_string(),
			DispatchedEvents::SessionReplace(_) => "SessionReplace".to_string(),
			DispatchedEvents::MessageCreate(_) => "MessageCreated".to_string(),
			DispatchedEvents::MessageDelete(_) => "MessageDelete".to_string(),
			DispatchedEvents::TypingStart(_) => "StartTyping".to_string(),
			DispatchedEvents::Unknown(_) => "Unknown".to_string(),
			DispatchedEvents::ReadySupplemental(_) => "ReadySupplemental".to_string(),
			DispatchedEvents::MessageUpdate(_) => "MessageUpdated".to_string(),
			DispatchedEvents::BurstCreditBalanceUpdate(_) => "BurstCreditBalanceUpdate".to_string(),
			DispatchedEvents::VoiceServerUpdate(_) => "VoiceServerUpdate".to_string(),
			DispatchedEvents::VoiceStateUpdate(_) => "VoiceStateUpdate".to_string(),
		}
	}
}

#[derive(Debug)]
pub enum IncomingPacketsData {
	Hello(Hello),
	/// Discord documentation states that this send and received by client<br>
	/// opcode: `1`
	Heartbeat(Heartbeat),
	///Sent in response to receiving a heartbeat to acknowledge that it has been received.<br>
	/// opcode: `11`
	HeartbeatAck,

	///You should attempt to reconnect and resume immediately.
	/// opcode: `6`
	Reconnect,

	///Event dispatched by Discord<br>
	/// opcode: `0`
	DispatchedEvent(DispatchedEvents),
}
impl ToString for IncomingPacketsData {
	fn to_string(&self) -> String {
		match self {
			IncomingPacketsData::Hello(_) => "Hello".to_string(),
			IncomingPacketsData::Heartbeat(_) => "Heartbeat".to_string(),
			IncomingPacketsData::HeartbeatAck => "HeartbeatAck".to_string(),
			IncomingPacketsData::DispatchedEvent(d) => d.to_string(),
			IncomingPacketsData::Reconnect => "Reconnect".to_string(),
		}
	}
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
	Resume = 6,
	///You should attempt to reconnect and resume immediately.
	Reconnect = 7,
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
	pub payload_type: Option<String>,
	pub sequence_number: Option<u64>,
	pub op_code: OpCode,
	pub data: IncomingPacketsData,
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
					let a = match t.as_str() {
						"READY" =>
							DispatchedEvents::Ready(
								serde_json
									::from_value(inner.d)
									.map_err(|x|
										serde::de::Error::custom(
											format!("Error While deserializng Ready Packet {:?}", x)
										)
									)?
							),
						"READY_SUPPLEMENTAL" =>
							DispatchedEvents::ReadySupplemental(
								serde_json
									::from_value(inner.d)
									.map_err(|x|
										serde::de::Error::custom(
											format!("Error While deserializng ReadySupplemental Packet {:?}", x)
										)
									)?
							),
						"SESSIONS_REPLACE" =>
							DispatchedEvents::SessionReplace(
								serde_json
									::from_value(inner.d)
									.map_err(|x|
										serde::de::Error::custom(
											format!("Error While deserializng SessionReplace Packet {:?}", x)
										)
									)?
							),
						"TYPING_START" =>
							DispatchedEvents::TypingStart(
								serde_json
									::from_value(inner.d)
									.map_err(|x|
										serde::de::Error::custom(
											format!("Error While deserializng StartTyping Packet {:?}", x)
										)
									)?
							),
						"MESSAGE_DELETE" =>
							DispatchedEvents::MessageDelete(
								serde_json
									::from_value(inner.d)
									.map_err(|x|
										serde::de::Error::custom(
											format!("Error While deserializng MessageDelete Packet{:?}", x)
										)
									)?
							),

						"MESSAGE_CREATE" =>
							DispatchedEvents::MessageCreate(
								serde_json
									::from_value(inner.d)
									.map_err(|x|
										serde::de::Error::custom(
											format!("Error While deserializng {} Packet {:?}", t, x)
										)
									)?
							),

						"MESSAGE_UPDATE" =>
							DispatchedEvents::MessageUpdate(
								serde_json
									::from_value(inner.d)
									.map_err(|x|
										serde::de::Error::custom(
											format!("Error While deserializng {} Packet {:?}", t, x)
										)
									)?
							),
						"BURST_CREDIT_BALANCE_UPDATE" => DispatchedEvents::BurstCreditBalanceUpdate(inner.d), //TODO: Implement

						"VOICE_SERVER_UPDATE" =>
							DispatchedEvents::VoiceServerUpdate(
								serde_json
									::from_value(inner.d)
									.map_err(|x|
										serde::de::Error::custom(
											format!("Error While deserializng {} Packet {:?}", t, x)
										)
									)?
							),

						"VOICE_STATE_UPDATE" =>
							DispatchedEvents::VoiceStateUpdate(
								serde_json
									::from_value(inner.d)
									.map_err(|x|
										serde::de::Error::custom(
											format!("Error While deserializng {} Packet {:?}", t, x)
										)
									)?
							), //TODO: Implement

						_ => DispatchedEvents::Unknown(inner.d),
					};
					IncomingPacketsData::DispatchedEvent(a)
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
			OpCode::Reconnect => IncomingPacketsData::Reconnect,
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

pub enum ErrorCodes {
	///	We're not sure what went wrong. Try reconnecting?
	///
	/// reconnect: true
	UnknownError = 4000,
	/// You sent an invalid [`Gateway opcode`] or an invalid payload for an opcode. Don't do that!
	///
	/// reconnect: true
	///
	/// [`Gateway opcode`]: self::OpCode
	UnknownOpCode = 4001,

	///You sent an invalid [`payload`] to Discord. Don't do that!
	///
	/// reconnect: true
	///
	/// [`payload`]: self::OutGoingPacketsData
	DecodeError = 4002,

	///You sent us a payload prior to [`identifying`].
	///
	/// reconnect: true
	///
	/// [`identifying`]: self::OutGoingPacketsData#variant.Identify
	NotAuthenticated = 4003,

	///	The account token sent with your [`identify payload`] is incorrect.
	///
	/// reconnect: false
	///
	/// [`identify payload`]: self::OutGoingPacketsData#variant.Identify
	AuthenticationFailed = 4004,

	///You sent more than one [`identify payload`]. Don't do that!
	///
	/// reconnect: true
	///
	/// [`identify payload`]: self::OutGoingPacketsData#variant.Identify
	AlreadyAuthenticated = 4005,

	///The sequence sent when [`resuming`] the session was invalid. Reconnect and start a new session.
	///
	/// reconnect: true
	///
	/// [`resuming`]: self::OutGoingPacketsData#variant.Resume
	InvalidSequence = 4007,

	///Woah nelly! You're sending payloads to us too quickly. Slow it down! You will be disconnected on receiving this.
	///
	/// reconnect: true
	RateLimited = 4008,

	///Your session timed out. Reconnect and start a new one.
	///
	/// reconnect: true
	SessionTimedOut = 4009,

	///You sent an invalid version for the gateway.
	///
	/// reconnect: false
	InvalidApiVersion = 4012,

	///You sent an invalid intent for a `Gateway Intent`. You may have incorrectly calculated the bitwise value.
	///
	/// reconnect: false
	InvalidIntent = 4013,

	///You sent a disallowed intent for a `Gateway Intent`. You may have tried to specify an intent that you have not enabled or are not whitelisted for.
	///
	/// reconnect: false
	DisallowedIntent = 4014,
}
