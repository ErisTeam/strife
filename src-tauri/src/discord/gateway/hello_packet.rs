use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub(crate) struct HelloPacket {
    pub heartbeat_interval: u64,
    pub timeout_ms: u64,
    pub op: String,
}