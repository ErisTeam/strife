use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize)]
pub struct InitPacket {
    pub encoded_public_key: String,
}