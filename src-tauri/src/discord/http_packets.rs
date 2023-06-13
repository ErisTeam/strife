pub mod auth {
	use serde::{ Deserialize, Serialize };
	#[derive(Serialize, Deserialize, Debug)]
	pub struct LoginRequest {
		captcha_key: Option<String>,
		email: String,
		password: String,
		undelete: bool,
		login_source: Option<String>,
		gift_code_sku_id: Option<String>,
	}

	#[derive(Serialize, Deserialize, Debug)]
	#[serde(untagged)]
	pub enum LoginResponse {
		Success {
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
			code: u64,
			errors: ErrorTypes,
			message: String,
		},
	}

	pub mod mobile_auth {
		use serde::Serialize;

		#[derive(Serialize)]
		pub struct Login {
			pub ticket: String,
		}
	}
	#[derive(Serialize, Deserialize, Debug, Clone)]
	pub struct Error {
		code: String,
		message: String,
	}

	#[derive(Serialize, Deserialize, Debug, Clone)]
	pub struct LoginError {
		#[serde(rename = "_errors")]
		errors: Vec<Error>,
	}
	#[derive(Serialize, Deserialize, Debug, Clone)]
	pub struct ErrorTypes {
		pub login: Option<LoginError>,
		pub password: Option<LoginError>,
		pub email: Option<LoginError>,
	}
}
