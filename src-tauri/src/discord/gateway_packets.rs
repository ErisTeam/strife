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
#[derive(Serialize, Deserialize)]
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
}