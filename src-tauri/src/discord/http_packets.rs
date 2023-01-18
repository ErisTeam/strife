use serde::{ Serialize, Deserialize };

#[derive(Serialize, Deserialize, Debug)]
pub enum Auth {
    Login {
        ticket: String,
    },
    LoginResponse {
        encrypted_token: String,
    },
}