use serde::{ Deserialize, Serialize };
/// todo description
#[derive(Serialize, Deserialize)]
#[serde(tag = "op")]
pub enum MobileAuthGatewayPackets {
    #[serde(rename = "heartbeat")] Heartbeat {},
    #[serde(rename = "heartbeat_ack")] HeartbeatAck {},
    #[serde(rename = "hello")] Hello {
        heartbeat_interval: u64,
        timeout_ms: u64,
    },

    #[serde(rename = "init")] Init {
        encoded_public_key: String,
    },
    #[serde(rename = "nonce_proof")] NonceProofServer {
        encrypted_nonce: String,
    },
    #[serde(rename = "nonce_proof")] NonceProofClient {
        proof: String,
    },
    #[serde(rename = "pending_remote_init")] PendingRemoteInit {
        fingerprint: String,
    },
    #[serde(rename = "pending_ticket")] PendingTicket {
        encrypted_user_payload: String,
    },

    #[serde(rename = "pending_login")] PendingLogin {
        ticket: String,
    },
    #[serde(rename = "cancel")] Cancel {},
}