use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum Auth {
	Login {
		ticket: String,
	},
	LoginResponse {
		encrypted_token: String,
	},
	RequireAuth {
		captcha_key: Option<Vec<String>>,
		captcha_sitekey: Option<String>,
		captcha_service: Option<String>,
		captcha_rqdata: Option<String>,
		captcha_rqtoken: Option<String>,
	},
	Error {
		code: u32,
		errors: String,
		message: String,
	},
}
