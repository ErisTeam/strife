use serde::{ Serialize, Deserialize };

#[derive(Serialize, Deserialize)]
struct LoginRequest {
	captcha_key: Option<String>,
	email: String,
	password: String,
	undelete: bool,
	login_source: Option<String>,
	gift_code_sku_id: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LoginResponse {
	captcha_key: Vec<String>,
	captcha_sitekey: String,
	captcha_service: String,
	token: Option<String>,
	sms: Option<bool>,
	ticket: Option<String>,
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
		let client = reqwest::Client::new();
		let res = client
			.post("https://discord.com/api/v9/auth/login")
			.header("credentials", "include")
			.json(
				&(LoginRequest {
					captcha_key: captcha_token,
					email: login,
					password,
					undelete: false,
					login_source: None,
					gift_code_sku_id: None,
				})
			)
			.send().await
			.unwrap();
		let j = res.json::<LoginResponse>().await.unwrap();
		println!("{:?}", j);
		return j;
	}
}