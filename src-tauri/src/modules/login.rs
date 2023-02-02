use serde::{ Serialize, Deserialize };

#[derive(Serialize, Deserialize, Debug)]
struct LoginRequest {
	captcha_key: Option<String>,
	email: String,
	password: String,
	undelete: bool,
	login_source: Option<String>,
	gift_code_sku_id: Option<String>,
}
//todo simplify
#[derive(Serialize, Deserialize, Debug)]
pub struct Error {
	code: String,
	message: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LoginError {
	_errors: Vec<Error>,
}
#[derive(Serialize, Deserialize, Debug)]
pub struct err {
	login: Option<LoginError>,
	password: Option<LoginError>,
	email: Option<LoginError>,
}
//-----------------------
#[derive(Serialize, Deserialize, Debug)]
pub struct UserSettings {
	locale: String,
	theme: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum LoginResponse {
	Success {
		token: String,
		user_settings: UserSettings,
		user_id: String,
	},
	RequireAuth {
		captcha_key: Vec<String>,
		captcha_sitekey: String,
		captcha_service: String,

		sms: Option<bool>,
		ticket: Option<String>,
	},
	Error {
		code: u64,
		errors: err,
		message: String,
	},
}

pub struct Login {}

impl Login {
	pub fn new() -> Self {
		Self {}
	}

	pub async fn login(
		&self,
		captcha_token: Option<String>,
		login: String,
		password: String
	) -> LoginResponse {
		let body = LoginRequest {
			captcha_key: captcha_token,
			email: login,
			password,
			undelete: false,
			login_source: None,
			gift_code_sku_id: None,
		};
		let client = reqwest::Client::new();
		let res = client
			.post("https://discord.com/api/v9/auth/login")
			.header("credentials", "include")
			.json(&body)
			.send().await
			.unwrap();
		let text = res.text().await.unwrap();
		println!("json: {}", text);
		//res.json::<LoginResponse>().await.unwrap()
		serde_json::from_str(&text).unwrap()
	}
}