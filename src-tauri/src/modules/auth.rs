use std::sync::{ Weak, Arc };
use log::{ warn, info };
use serde::{ Deserialize, Serialize };
use serde_json::json;
use tauri::AppHandle;
use tokio::runtime::Handle;
use tokio::sync::RwLock;
use crate::{ Result, webview_packets };
use crate::discord::constants;
use crate::main_app_state::MainState;
use super::mobile_auth::MobileAuth;

#[derive(Serialize, Deserialize, Debug)]
struct LoginRequest {
	captcha_key: Option<String>,
	email: String,
	password: String,
	undelete: bool,
	login_source: Option<String>,
	gift_code_sku_id: Option<String>,
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
//-----------------------
#[derive(Serialize, Deserialize, Debug, Clone)]
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
	Error {
		code: u64,
		errors: ErrorTypes,
		message: String,
	},
	RequireAuth {
		captcha_key: Option<Vec<String>>,
		captcha_sitekey: Option<String>,
		captcha_service: Option<String>,
		mfa: Option<bool>,
		sms: Option<bool>,
		ticket: Option<String>,
	},
}

#[derive(Deserialize, Debug)]
#[serde(untagged)]
pub enum MFAResponse {
	Success {
		token: String,
		user_settings: UserSettings,
		//user_id: String,
	},
	Error {
		code: u64,
		message: String,
	},
}

#[derive(Debug, Clone)]
pub enum Cos { //todo change name
	Login,
	UpdateQrUserData {
		user_id: String,
		discriminator: String,
		avatar_hash: String,
		username: String,
	},
	UpdateQrCode {
		ticket: String,
	},
}

#[derive(Debug)]
pub struct Auth {
	pub gateway: Arc<RwLock<MobileAuth>>,
	state: Weak<MainState>,
}

impl Auth {
	pub fn new(state: Weak<MainState>) -> Self {
		Self {
			gateway: Arc::new(RwLock::new(MobileAuth::new())),
			state,
		}
	}
	pub async fn login_request(
		captcha_token: Option<String>,
		login: String,
		password: String
	) -> Result<LoginResponse> {
		let body = LoginRequest {
			captcha_key: captcha_token,
			email: login,
			password,
			undelete: false,
			login_source: None,
			gift_code_sku_id: None,
		};
		let client = reqwest::Client::new();
		let res = client.post(constants::LOGIN).header("credentials", "include").json(&body).send().await?;
		let text = res.text().await?;
		println!("json: {}", text);
		//res.json::<LoginResponse>().await.unwrap()
		Ok(serde_json::from_str(&text)?)
	}

	pub async fn login(
		&mut self,
		captcha_token: Option<String>,
		login: String,
		password: String
	) -> Result<webview_packets::Auth> {
		let res = Self::login_request(captcha_token, login, password).await?;

		let state = self.state.upgrade().ok_or("state is none")?;

		let response: webview_packets::Auth;

		match res {
			LoginResponse::Success { token, user_id, user_settings } => {
				println!("token: {}", token);

				state.add_new_user(user_id.clone(), token.clone());

				response = webview_packets::Auth::LoginSuccess { user_id, user_settings: Some(user_settings) };
			}
			LoginResponse::RequireAuth { ticket, captcha_key, captcha_service, captcha_sitekey, sms, mfa } => {
				info!("RequireAuth");

				//todo store ticket
				response = webview_packets::Auth::RequireAuth {
					captcha_key,
					captcha_sitekey,
					captcha_service,
					sms,
					mfa,
				};
			}
			LoginResponse::Error { message, code, errors } => {
				println!("message: {}", message);
				response = webview_packets::Auth::Error { code, errors, message };
			}
		}
		Ok(response)
	}

	pub async fn start_gateway(&mut self, handle: AppHandle) -> Result<()> {
		let mut gateway = self.gateway.write().await;

		let (auth_sender, _) = tokio::sync::mpsc::channel(1);

		let mut reciver = gateway.start(handle.clone(), auth_sender.clone()).await?;
		let gateway = Arc::downgrade(&self.gateway);
		let handle = handle;
		tokio::spawn(async move {
			loop {
				let r = reciver.recv().await;
				let gateway = gateway.upgrade();
				if let Err(e) = r {
					warn!("error: {}", e);

					if let Some(gateway) = gateway {
						let gateway = gateway.read().await;
						let _ = gateway.stop();
					}
					break;
				}
				if let Some(gateway) = gateway {
					let mut gateway = gateway.write().await;
					*gateway = MobileAuth::new();
					let _ = gateway.start(handle.clone(), auth_sender.clone()).await;
				}
			}
		});
		Ok(())
	}

	//todo Make it work
	pub async fn login_mobile_auth(captcha_token: String, captcha_key: String, captcha_rqtoken: String) -> Result<()> {
		let client = reqwest::Client::new();
		let res = client
			.post("https://discord.com/api/v9/users/@me/remote-auth/login")
			.json(
				&json!({
                "ticket":captcha_token,
                "captcha_key": captcha_key,
                "captcha_rqtoken":captcha_rqtoken
            })
			)
			.send().await?;
		let text = res.text().await?;
		println!("json: {}", text);
		Ok(())
	}

	pub async fn send_sms(ticket: String) -> Result<String> {
		let client = reqwest::Client::new();
		let res = client
			.post(constants::SMS_SEND)
			.json(&json!({ "ticket": ticket }))
			.send().await
			.unwrap();
		let text = res.text().await?;
		println!("send sms res: {}", text);
		Ok(":)".to_string())
	}
	pub async fn verify_sms(ticket: String, code: String) -> Result<MFAResponse> {
		let client = reqwest::Client::new();
		let res = client
			.post(constants::VERIFY_SMS)
			.json(&json!({
                "ticket":ticket,
                "code":code
            }))
			.send().await?;
		let text = res.text().await?;
		println!("verify sms res: {}", text);
		// todo!("verify_sms")
		return Ok(serde_json::from_str::<MFAResponse>(&text)?);
	}
	pub async fn verify_totp(ticket: String, code: String) -> Result<MFAResponse> {
		let client = reqwest::Client::new();
		let res = client
			.post(constants::VERIFY_TOTP)
			.json(&json!({
                "ticket":ticket,
                "code":code
            }))
			.send().await?;
		let text = res.text().await?;
		println!("json: {}", text);
		let res = serde_json::from_str::<MFAResponse>(&text)?;
		println!("json: {:?}", res);

		Ok(res)
	}
}
impl Drop for Auth {
	fn drop(&mut self) {
		//find a better way to do this
		tokio::task::block_in_place(move || {
			Handle::current().block_on(async move {
				let gateway = self.gateway.read().await;
				gateway.stop();
			});
		});
	}
}
