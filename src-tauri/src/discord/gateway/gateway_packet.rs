use serde::{ Deserialize, Serialize };

#[derive(Serialize, Deserialize)]
#[serde(tag = "op")]
pub enum GatewayPacket {
    #[serde(alias = "heartbeat")] Heartbeat {},
    #[serde(alias = "heartbeat_ack")] HeartbeatAck {},
    #[serde(alias = "hello")] Hello {
        heartbeat_interval: u64,
        timeout_ms: u64,
    },
    #[serde(alias = "init")] Init {
        encoded_public_key: String,
    },
    #[serde(alias = "nonce_proof")] NonceProofServer {
        encrypted_nonce: String,
    },
    #[serde(alias = "nonce_proof")] NonceProofClient {
        proof: String,
    },
    #[serde(alias = "pending_remote_init")] PendingRemoteInit {
        fingerprint: String,
    },
}