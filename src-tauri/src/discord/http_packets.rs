use serde::{ Serialize, Deserialize };

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum Auth {
    Login {
        ticket: String,
    },
    LoginResponse {
        encrypted_token: String,
    },
    Error {
        code: u32,
        errors: String,
        message: String,
    },
}