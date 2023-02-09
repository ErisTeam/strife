use serde::{ Serialize, Deserialize };
use serde_json::json;

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
		captcha_key: Option<Vec<String>>,
		captcha_sitekey: Option<String>,
		captcha_service: Option<String>,
		mfa: Option<bool>,
		sms: Option<bool>,
		ticket: Option<String>,
	},
	Error {
		code: u64,
		errors: err,
		message: String,
	},
}

#[derive(Deserialize, Debug)]
pub enum MFAResponse {
	Success {
		token: String,
		user_settings: UserSettings,
		user_id: String,
	},
	Error {
		code: u64,
		message: String,
	},
}

pub struct Auth {}

impl Auth {
	pub async fn login(
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
	pub async fn send_sms(ticket: String) -> String {
		let client = reqwest::Client::new();
		let res = client
			.post("https://discord.com/api/v9/auth/mfa/sms/send")
			.json(&json!({
				"ticket":ticket
			}))
			.send().await
			.unwrap();
		let text = res.text().await.unwrap();
		println!("json: {}", text);
		":)".to_string()
	}
	pub async fn verify_sms(ticket: String, code: String) {
		let client = reqwest::Client::new();
		let res = client
			.post("https://discord.com/api/v9/auth/mfa/sms")
			.json(&json!({
				"ticket":ticket,
				"code":code
			}))
			.send().await
			.unwrap();
		let text = res.text().await.unwrap();
		println!("json: {}", text);
		todo!("verify_sms")
	}
	pub async fn verify_totp(ticket: String, code: String) -> Result<MFAResponse, ()> {
		let client = reqwest::Client::new();
		let res = client
			.post("https://discord.com/api/v9/auth/mfa/totp")
			.json(&json!({
				"ticket":ticket,
				"code":code
			}))
			.send().await
			.unwrap();
		let text = res.text().await.unwrap();
		println!("json: {}", text);
		let res = serde_json::from_str::<MFAResponse>(&text);
		if res.is_err() {
			return Err(());
		} else {
			return Ok(res.unwrap());
		}
	}
}