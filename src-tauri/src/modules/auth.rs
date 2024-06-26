use std::sync::{ Weak, Arc };
use base64::Engine;
use log::{ info, error, debug };
use rsa::Oaep;
use serde::{ Deserialize, Serialize };
use serde_json::json;
use tauri::{ AppHandle, Manager };
use tokio::runtime::Handle;
use tokio::sync::RwLock;
use crate::discord::http_packets::auth::{ ErrorTypes, LoginRequest };
use crate::discord::types::gateway::Properties;
use crate::{ Result, webview_packets, token_utils };
use crate::discord::{ constants, http_packets, idk };
use crate::main_app_state::MainState;
use super::remote_auth::MobileAuth;

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
pub enum RemoteAuthMessages {
	Login {
		ticket: String,
		private_key: Arc<rsa::RsaPrivateKey>,
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

	pub captcha_data: Arc<RwLock<Option<CaptchaData>>>,
}

impl Auth {
	pub fn new(state: Weak<MainState>) -> Self {
		Self {
			gateway: Arc::new(RwLock::new(MobileAuth::new())),
			state,
			ticket: RwLock::new(None),
			captcha_data: Arc::new(RwLock::new(None)),
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
				let user_info = idk::get_user_info(token.clone()).await?;

				state.user_manager.add_user(user_id.clone(), crate::modules::user_manager::User {
					state: crate::modules::user_manager::State::LoggedIn,
					token: Some(token),
					global_name: Some(user_info.get_name()),
					avatar_hash: user_info.avatar,
				}).await;

				state.user_manager.save_to_file().await?;

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
		mut auth_receiver: tokio::sync::mpsc::Receiver<RemoteAuthMessages>,
		state: Weak<MainState>,
		gateaway: Weak<RwLock<MobileAuth>>,
		captcha_data: Weak<RwLock<Option<CaptchaData>>>,
		handle: AppHandle
	) -> std::result::Result<(), Box<dyn std::error::Error + Sync + Send>> {
		let mut avatar_hash = None;
		let mut global_name = None;
		loop {
			let payload = auth_receiver.recv().await;
			if let Some(payload) = payload {
				match payload {
					RemoteAuthMessages::Login { ticket, private_key } => {
						let res = Self::login_remote_auth(ticket, None, None).await?;
						match res {
							http_packets::auth::LoginResponse::Success { encrypted_token } => {
								debug!("LoginResponse::Success");
								let state = state.upgrade().ok_or("State was None")?;

								let decoded = base64::engine::general_purpose::STANDARD.decode(&encrypted_token)?;
								let decrypted = private_key.decrypt(Oaep::new::<sha2::Sha256>(), &decoded)?;

								let token = String::from_utf8(decrypted)?;

								let user_id = token_utils
									::get_id(&token)
									.map_err(|e| format!("Failed to get user id: {}", e))?;

								#[cfg(debug_assertions)]
								println!("id:{} \n token: {}", user_id, token);

								state.user_manager.add_user(user_id.clone(), crate::modules::user_manager::User {
									state: crate::modules::user_manager::State::LoggedIn,
									token: Some(token),
									global_name: global_name.clone(),
									avatar_hash: avatar_hash.clone(),
								}).await;

								state.user_manager
									.save_to_file().await
									.map_err(|e| format!("Failed to save user manager: {}", e))?;

								let gateway = gateaway.upgrade().ok_or("gateway was None")?;

								let gateway = gateway.read().await;
								gateway.stop();

								handle.emit_all("auth", webview_packets::auth::Auth::LoginSuccess {
									user_id,
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
								let captcha_data = captcha_data.upgrade().ok_or("captcha_data is none")?;
								captcha_data.write().await.replace(CaptchaData {
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
					RemoteAuthMessages::UpdateQrUserData { user_id, discriminator, avatar_hash: avatar, username } => {
						global_name = Some(username.clone());
						avatar_hash = Some(avatar.clone());

						handle.emit_all("auth", webview_packets::auth::Auth::MobileTicketData {
							user_id,
							discriminator,
							avatar_hash: avatar,
							username,
						})?;
						debug!("Sent ticket data");
					}
					RemoteAuthMessages::UpdateQrCode { fingerprint } => {
						handle.emit_all("auth", webview_packets::auth::Auth::MobileQrcode {
							qrcode: Some(format!("https://discordapp.com/ra/{}", fingerprint)),
						})?;
						debug!("Sent qrcode");
					}
					RemoteAuthMessages::CancelQrCode => {
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

	pub async fn start_gateway(&mut self, handle: AppHandle) -> std::result::Result<(), Box<dyn std::error::Error>> {
		let mut gateway = self.gateway.write().await;

		let (auth_sender, auth_reciver) = tokio::sync::mpsc::channel(1);

		let mut error_receiver = gateway.start(handle.clone(), auth_sender.clone()).await?;

		{
			let stop = gateway.stop_notifyer().ok_or("stop_notifyer is none")?;
			let gateway = Arc::downgrade(&self.gateway);
			let captcha_data = Arc::downgrade(&self.captcha_data);

			let state = self.state.clone();
			let handle = handle.clone();

			tokio::spawn(async move {
				tokio::select! {
						_ = stop.notified() =>{
							debug!("Stopping Auth Receiver thread");
						},
						_res = Self::receiver_thread(auth_reciver,state,gateway.clone(),captcha_data,handle) =>{
							if let Some(gateway) = gateway.upgrade(){
								gateway.write().await.stop();
							}
						}
					
				}
			});
		}

		let stop = gateway.stop_notifyer().unwrap();
		let gateway = Arc::downgrade(&self.gateway);
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
					if e == "ConnectionClosed" {
						println!("Connection closed");
					}
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
		Ok(())
	}

	//TODO: check if works
	pub async fn login_remote_auth(
		ticket: String,
		rqtoken: Option<String>,
		captcha_key: Option<String>
	) -> std::result::Result<http_packets::auth::LoginResponse, Box<dyn std::error::Error + Sync + Send>> {
		let client = reqwest::Client::new();
		let mut request = client
			.post(constants::REMOTE_AUTH_LOGIN)
			.header("Content-Type", "application/json")
			.header("x-super-properties", Properties::default().base64().unwrap())
			.body(serde_json::to_string(&(http_packets::auth::mobile_auth::Login { ticket }))?);
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
		Ok(serde_json::from_str::<MFAResponse>(&text)?)
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
			VerificationMethod::Sms => { Self::verify_sms(t, code).await }
			VerificationMethod::Mfa => { Self::verify_totp(t.clone(), code).await }
		}
	}

	pub fn stop_sync(&self) {
		debug!("Stopping Auth");
		tokio::task::block_in_place(move || {
			Handle::current().block_on(async move {
				self.stop().await;
			});
		});
	}
	pub async fn stop(&self) {
		let gateway = self.gateway.read().await;
		gateway.stop();
	}
}
impl Drop for Auth {
	fn drop(&mut self) {
		debug!("Dropping Auth");

		self.stop_sync();
	}
}
