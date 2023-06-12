use serde::{ Deserialize, Serialize };

/// # Information
/// TODO
#[derive(Serialize, Deserialize)]
#[serde(tag = "op")]
pub enum Packets {
	/// Sent every N ms, described in `hello` packet
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

	/// Sent after `hello`, describes generated public key
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

	/// Sent after `nonce_proof`, contains decrypted nonce as "proof"
	#[serde(rename = "nonce_proof")]
	NonceProof {
		proof: String,
	},

	/// Sent after a valid `nonce_proof` is submitted
	#[serde(rename = "pending_remote_init")]
	PendingRemoteInit {
		fingerprint: String,
	},

	/// Sent after QR code is scanned, contains encrypted user data
	#[serde(rename = "pending_ticket")]
	PendingTicket {
		encrypted_user_payload: String,
	},

	/// # Information
	/// Sent after login flow is completed, contains encrypted ticket
	#[serde(rename = "pending_login")]
	PendingLogin {
		ticket: String,
	},

	/// # Information
	/// TODO
	#[serde(rename = "cancel")]
	Cancel {},
}
#[derive(Serialize, Deserialize)]
#[serde(tag = "op")]
pub enum IncomingPackets {
	///Sent on connection open
	#[serde(rename = "hello")]
	Hello {
		heartbeat_interval: u64,
		timeout_ms: u64,
	},
	///Sent after `init`, contains encrypted nonce
	#[serde(rename = "nonce_proof")]
	NonceProof {
		encrypted_nonce: String,
	},

	/// Sent after `heartbeat` packet, should close connection if a `heartbeat_ack` isn't received by the next `heartbeat` interval
	#[serde(rename = "heartbeat_ack")]
	HeartbeatAck {},

	/// Sent after a valid `nonce_proof` is submitted
	#[serde(rename = "pending_remote_init")]
	PendingRemoteInit {
		fingerprint: String,
	},

	/// Sent after QR code is scanned, contains encrypted user data
	#[serde(rename = "pending_ticket")]
	PendingTicket {
		encrypted_user_payload: String,
	},

	/// Sent after login flow is completed, contains encrypted ticket
	#[serde(rename = "pending_login")]
	PendingLogin {
		ticket: String,
	},

	///When the user cancels the login on their device, the server sends a `cancel` packet. This event also marks the closing of the websocket.
	#[serde(rename = "cancel")]
	Cancel {},
}
