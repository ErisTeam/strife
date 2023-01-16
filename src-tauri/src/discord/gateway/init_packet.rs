use serde::{ Deserialize, Serialize };
fn default() -> String {
    "init".to_string()
}
#[derive(Debug, Serialize, Deserialize)]
pub struct InitPacket {
    #[serde(default = "default")]
    pub op: String,
    pub encoded_public_key: String,
}