use serde::{ Deserialize, Serialize };

/// # Information
/// TODO
#[derive(Serialize, Deserialize)]
#[serde(tag = "op")]
pub enum OutGoingPackets {
	/// Sent every N ms, described in [`hello`] packet
	///
	/// [`hello`]: self::IncomingPackets#variant.Hello
	#[serde(rename = "heartbeat")]
	Heartbeat {},

	/// Sent after [`hello`], describes generated public key
	///
	/// [`hello`]: self::IncomingPackets#variant.Hello
	#[serde(rename = "init")]
	Init {
		encoded_public_key: String,
	},

	/// Sent after [`nonce_proof`], contains decrypted nonce as "proof"
	///
	/// [`nonce_proof`]: self::IncomingPackets#variant.NonceProof
	#[serde(rename = "nonce_proof")]
	NonceProof {
		proof: String,
	},
}
#[derive(Serialize, Deserialize)]
#[serde(tag = "op")]
#[serde(rename_all = "snake_case")]
pub enum IncomingPackets {
	///Sent on connection open
	Hello {
		heartbeat_interval: u64,
		timeout_ms: u64,
	},
	///Sent after [`init`], contains encrypted nonce
	///
	/// [`init`]: self::OutGoingPackets#variant.Init
	NonceProof {
		encrypted_nonce: String,
	},

	/// Sent after [`heartbeat`] packet, should close connection if a [`heartbeat_ack`] isn't received by the next [`heartbeat`] interval
	///
	/// [`heartbeat`]: self::OutGoingPackets#variant.Heartbeat
	/// [`heartbeat_ack`]: self::IncomingPackets#variant.HeartbeatAck
	HeartbeatAck,

	/// Sent after a valid `nonce_proof` is submitted
	///
	/// [`nonce_proof`]: self::OutGoingPackets#variant.NonceProof
	PendingRemoteInit {
		fingerprint: String,
	},

	/// Sent after QR code is scanned, contains encrypted user data
	PendingTicket {
		encrypted_user_payload: String,
	},

	/// Sent after login flow is completed, contains encrypted ticket
	PendingLogin {
		ticket: String,
	},

	///When the user cancels the login on their device, the server sends a `cancel` packet. This event also marks the closing of the websocket.
	///
	/// [`cancel`]: self::IncomingPackets#variant.Cancel
	Cancel {},
}
