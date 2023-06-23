use std::sync::{ Weak, Arc };
use base64::Engine;
use log::{ info, error, debug };
use rsa::PaddingScheme;
use serde::{ Deserialize, Serialize };
use serde_json::json;
use tauri::{ AppHandle, Manager };
use tokio::runtime::Handle;
use tokio::sync::RwLock;
use crate::discord::http_packets::auth::{ ErrorTypes, LoginRequest };
use crate::discord::types::gateway::Properties;
use crate::{ Result, webview_packets, token_utils };
use crate::discord::{ constants, http_packets };
use crate::main_app_state::MainState;
use super::mobile_auth::MobileAuth;

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

#[derive(Deserialize, Debug)]
pub enum VerificationMethod {
	Sms,
	Mfa,
}

#[derive(Debug, Clone)]
pub enum Cos { //TODO change name
	Login {
		ticket: String,
		private_key: rsa::RsaPrivateKey,
	},
	UpdateQrUserData {
		user_id: String,
		discriminator: String,
		avatar_hash: String,
		username: String,
	},
	UpdateQrCode {
		fingerprint: String,
	},
	CancelQrCode,
}

#[derive(Debug)]
pub struct CaptchaData {
	pub captcha_data: String,
	pub captcha_token: String,
	pub captcha_sitekey: String,
}

#[derive(Debug)]
pub struct Auth {
	pub gateway: Arc<RwLock<MobileAuth>>,
	state: Weak<MainState>,

	ticket: RwLock<Option<String>>,

	pub captcha_data: RwLock<Option<CaptchaData>>,
}

impl Auth {
	pub fn new(state: Weak<MainState>) -> Self {
		Self {
			gateway: Arc::new(RwLock::new(MobileAuth::new())),
			state,
			ticket: RwLock::new(None),
			captcha_data: RwLock::new(None),
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
		let res = client
			.post(constants::LOGIN)
			.header("credentials", "include")
			.header("x-super-properties", Properties::default().base64()?)
			.json(&body)
			.send().await?;
		let text = res.text().await?;
		println!("json: {}", text);
		//res.json::<LoginResponse>().await.unwrap()
		Ok(serde_json::from_str(&text)?)
	}

	pub async fn login(
		&self,
		captcha_token: Option<String>,
		login: String,
		password: String
	) -> Result<webview_packets::auth::Auth> {
		let res = Self::login_request(captcha_token, login, password).await?;

		let state = self.state.upgrade().ok_or("state is none")?;

		let response: webview_packets::auth::Auth;

		match res {
			LoginResponse::Success { token, user_id, user_settings } => {
				println!("token: {}", token);

				state.add_new_user(user_id.clone(), token.clone());

				response = webview_packets::auth::Auth::LoginSuccess { user_id, user_settings: Some(user_settings) };
			}
			LoginResponse::RequireAuth {
				ticket: new_ticket,
				captcha_key,
				captcha_service,
				captcha_sitekey,
				sms,
				mfa,
			} => {
				info!("RequireAuth");

				let mut ticket = self.ticket.write().await;
				*ticket = new_ticket;

				response = webview_packets::auth::Auth::RequireAuth {
					captcha_key,
					captcha_sitekey,
					captcha_service,
					sms,
					mfa,
					remote_auth: false,
				};
			}
			LoginResponse::Error { message, code, errors } => {
				println!("message: {}", message);
				response = webview_packets::auth::Auth::Error { code, errors, message };
			}
		}
		Ok(response)
	}

	async fn receiver_thread(
		mut auth_receiver: tokio::sync::mpsc::Receiver<Cos>,
		this: Arc<Self>,
		handle: AppHandle
	) -> std::result::Result<(), Box<dyn std::error::Error + Sync + Send>> {
		loop {
			let payload = auth_receiver.recv().await;
			if let Some(payload) = payload {
				match payload {
					Cos::Login { ticket, private_key } => {
						match Self::login_mobile_auth(ticket, None, None).await.unwrap() {
							http_packets::auth::LoginResponse::Success { encrypted_token } => {
								debug!("LoginResponse::Success");
								let state = this.state.upgrade().unwrap(); //todo error handeling

								let decoded = base64::engine::general_purpose::STANDARD.decode(&encrypted_token)?;
								let decrypted = private_key.decrypt(
									PaddingScheme::new_oaep::<sha2::Sha256>(),
									&decoded
								)?;

								let token = String::from_utf8(decrypted)?;

								let user_id = token_utils::get_id(&token);
								println!("id:{} \n token: {}",user_id, token);
								state.add_new_user(user_id.clone(), token);

								let gateway = this.gateway.read().await;
								gateway.stop();

								handle.emit_all("auth", webview_packets::auth::Auth::LoginSuccess {
									user_id: user_id,
									user_settings: None,
								})?;
							}
							http_packets::auth::LoginResponse::RequireAuth {
								captcha_key,
								captcha_sitekey,
								captcha_service,
								captcha_rqdata,
								captcha_rqtoken,
							} => {
								let captcha_sitekey = captcha_sitekey.ok_or("captcha_sitekey is none")?;
								this.captcha_data.write().await.replace(CaptchaData {
									captcha_data: captcha_rqdata.ok_or("captcha_rqdata is none")?,
									captcha_token: captcha_rqtoken.ok_or("captcha_rqtoken is none")?,
									captcha_sitekey: captcha_sitekey.clone(),
								});
								handle.emit_all("auth", webview_packets::auth::Auth::RequireAuth {
									captcha_key,
									captcha_sitekey: Some(captcha_sitekey),
									captcha_service,
									mfa: None,
									sms: None,
									remote_auth: true,
								})?;
							}
							http_packets::auth::LoginResponse::Error { code, errors, message } => {
								error!("LoginResponse::Error: {}", message);
								handle.emit_all("auth", webview_packets::auth::Auth::Error { code, errors, message })?;
							}
						}
					}
					Cos::UpdateQrUserData { user_id, discriminator, avatar_hash, username } => {
						handle.emit_all("auth", webview_packets::auth::Auth::MobileTicketData {
							user_id,
							discriminator,
							avatar_hash,
							username,
						})?;
						debug!("Sent ticket data");
					}
					Cos::UpdateQrCode { fingerprint } => {
						handle.emit_all("auth", webview_packets::auth::Auth::MobileQrcode {
							qrcode: Some(format!("https://discordapp.com/ra/{}", fingerprint)),
						})?;
						debug!("Sent qrcode");
					}
					Cos::CancelQrCode => {
						handle.emit_all("auth", webview_packets::auth::Auth::MobileQrcode {
							qrcode: None,
						})?;
						debug!("Canceled qrcode");
					}
				}
			} else {
				error!("auth_reciver is none");
				return Err("auth_reciver is none".into());
			}
		}
	}

	pub async fn start_gateway(self, handle: AppHandle) -> std::result::Result<Arc<Self>, Box<dyn std::error::Error>> {
		let this = Arc::new(self);
		let mut gateway = this.gateway.write().await;

		let (auth_sender, auth_reciver) = tokio::sync::mpsc::channel(1);

		let mut error_receiver = gateway.start(handle.clone(), auth_sender.clone()).await?;

		{
			let stop = gateway.stop_notifyer().ok_or("stop_notifyer is none")?;
			let gateway = Arc::downgrade(&this.gateway);

			let this = this.clone();
			let handle = handle.clone();

			tokio::spawn(async move {
				tokio::select! {
						_ = stop.notified() =>{
							debug!("Stopping Auth Receiver thread");
						},
						_res = Self::receiver_thread(auth_reciver,this,handle) =>{
							if let Some(gateway) = gateway.upgrade(){
								gateway.write().await.stop();
							}
						}
					
				}
			});
		}

		let stop = gateway.stop_notifyer().unwrap();
		let gateway = Arc::downgrade(&this.gateway);
		let handle = handle;
		tokio::spawn(async move {
			#[derive(Debug)]
			enum SelectType {
				Stop,
				Error(String),
			}
			loop {
				let a: SelectType =
					tokio::select! {
					_ = stop.notified() =>{
						SelectType::Stop
					}
					e = error_receiver.recv() => {
						if let Err(e) = e {
							error!("Error receiver encountered an error: {}", e);
							break;
						}
						
						SelectType::Error(e.unwrap())
					}
				};
				if let SelectType::Stop = a {
					debug!("Stoping auth receiver");
					break;
				}
				handle
					.emit_all("auth", webview_packets::auth::Auth::MobileQrcode {
						qrcode: None,
					})
					.unwrap();
				println!("{:?}", a);
				if let SelectType::Error(e) = a {
					// todo!("Error handeling");
					println!("Error: {}", e);
					// if (e == "ConnectionClosed"){

					// }
					//TODO: Error handeling
				}

				let gateway = gateway.upgrade();

				if let Some(gateway) = gateway {
					debug!("Restarting mobile auth");
					let mut gateway = gateway.write().await;
					*gateway = MobileAuth::new();
					let e = gateway.start(handle.clone(), auth_sender.clone()).await;
					if let Ok(e) = e {
						error_receiver = e;
					} else {
						println!("{:?}", e);
						todo!("Error Message");
					}
				}
			}
		});
		Ok(this.clone())
	}

	//TODO: check if works
	pub async fn login_mobile_auth(
		ticket: String,
		rqtoken: Option<String>,
		captcha_key: Option<String>
	) -> std::result::Result<http_packets::auth::LoginResponse, Box<dyn std::error::Error + Sync + Send>> {
		let client = reqwest::Client::new();
		let mut request = client
			.post(constants::MOBILE_AUTH_GET_TOKEN)
			.header("Content-Type", "application/json")
			.header("x-super-properties", Properties::default().base64().unwrap())
			.body(serde_json::to_string(&(http_packets::auth::mobile_auth::Login { ticket: ticket }))?);
		if let Some(rqtoken) = rqtoken {
			request = request.header("x-captcha-rqtoken", rqtoken);
		}
		if let Some(captcha_key) = captcha_key {
			request = request.header("x-captcha-key", captcha_key);
		}

		let res = request.send().await?;
		if cfg!(debug_assertions) {
			let res = res.text().await?;

			println!("{:?}", res);
			return Ok(serde_json::from_str::<http_packets::auth::LoginResponse>(&res)?);
		}
		Ok(res.json::<http_packets::auth::LoginResponse>().await?)
	}

	pub async fn send_sms(&self) -> Result<String> {
		let ticket = self.ticket.read().await;
		let t;
		if let Some(ticket) = &*ticket {
			t = ticket.clone();
		} else {
			return Err("Ticket is none".into());
		}
		let client = reqwest::Client::new();
		let res = client
			.post(constants::SMS_SEND)
			.json(&json!({ "ticket": t }))
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

	pub async fn verify_login(&self, code: String, method: VerificationMethod) -> Result<MFAResponse> {
		let ticket = self.ticket.read().await;
		let t;
		if let Some(ticket) = &*ticket {
			t = ticket.clone();
		} else {
			return Err("Ticket is none".into());
		}

		match method {
			VerificationMethod::Sms => {
				return Ok(Self::verify_sms(t, code).await?);
			}
			VerificationMethod::Mfa => {
				return Ok(Self::verify_totp(t.clone(), code).await?);
			}
		}
	}

	pub fn stop(&self) {
		debug!("Stopping Auth");
		let gateway = self.gateway.clone();
		tokio::task::block_in_place(move || {
			Handle::current().block_on(async move {
				let gateway = gateway.read().await;
				gateway.stop();
			});
		});
	}
}
impl Drop for Auth {
	fn drop(&mut self) {
		debug!("Dropping Auth");

		self.stop();
	}
}
