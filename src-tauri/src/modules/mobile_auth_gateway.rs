use std::{ sync::Arc, time::Duration };

use base64::{ engine::general_purpose, Engine };
use futures_util::{ pin_mut, SinkExt, StreamExt, stream::{ SplitStream, SplitSink } };
use log::{ debug, error, info, warn };
use rsa::{ pkcs8::EncodePublicKey, PaddingScheme, RsaPrivateKey, RsaPublicKey };
use tauri::{ AppHandle, Manager };
use tokio_tungstenite::{ connect_async_tls_with_config, tungstenite::Message, WebSocketStream };
use websocket::OwnedMessage;

use crate::{
	discord::{ constants, http_packets::{ self, Auth }, mobile_auth_packets::{ self, Packets } },
	main_app_state::{ MainState, StateOld },
	modules::{ gateway::{ GatewayError, GatewayResult }, gateway_utils::send_heartbeat },
	webview_packets,
};

use super::gateway_utils::{ ConnectionInfo_old, ConnectionInfo };

enum GetTokenResponse {
	Other(String),
	RequireAuth {
		captcha_key: Option<Vec<String>>,
		captcha_sitekey: Option<String>,
		captcha_service: Option<String>,
		captcha_rqdata: Option<String>,
		captcha_rqtoken: Option<String>,
	},
}

pub struct MobileAuthConnectionData {
	pub public_key: RsaPublicKey,
	private_key: RsaPrivateKey,
}
impl MobileAuthConnectionData {
	fn decrypt(&self, bytes: Vec<u8>) -> Result<Vec<u8>, rsa::errors::Error> {
		let padding = PaddingScheme::new_oaep::<sha2::Sha256>();
		self.private_key.decrypt(padding, &bytes)
	}
}
/// # Information
/// Handles the QR code authentication, as well as sending <br>
/// the heartbeats.
///
/// # More Information
///
/// To start the authentication we generate a public key and <br>
/// send it to discord. We should receive encrypted data, <br>
/// decrypt it and send it back to ensure that the key is working.
///
/// After that, when the user scans the QE code, we are going <br>
/// to receive encrypted user data which contains:
///     - `user ID` (snowflake)
///     - `user discriminator` (string)
///     - `user avatar hash` (string)
///     - `username` (string) <br>
///
/// On the users app there should appear a prompt to accept or <br>
/// decline the logging in attempt. When the user accepts we <br>
/// are going to receive a ticket.
///
/// For more information on how all of this functions you <br>
/// should visit the [Unofficial Discord API](https://luna.gitlab.io/discord-unofficial-docs/desktop_remote_auth_v2.html).
#[derive(Debug)]
pub struct MobileAuthHandler {
	pub public_key: Option<RsaPublicKey>,
	private_key: Option<RsaPrivateKey>,

	app_state: Arc<MainState>,

	handle: AppHandle,

	reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,

	connection_info_old: ConnectionInfo_old,

	pub stop: Option<tokio::sync::broadcast::Sender<()>>,

	user_id: Option<String>,
}
impl MobileAuthHandler {
	pub fn new(
		app_state: Arc<MainState>,
		handle: AppHandle,
		reciver: tokio::sync::mpsc::Receiver<OwnedMessage>
	) -> Self {
		Self {
			app_state,
			public_key: None,
			private_key: None,
			handle,
			reciver,
			connection_info_old: ConnectionInfo_old::default(),
			user_id: None,
			stop: None,
		}
	}
	fn decrypt(&self, bytes: Vec<u8>) -> Vec<u8> {
		let padding = PaddingScheme::new_oaep::<sha2::Sha256>();
		self.private_key.as_ref().unwrap().decrypt(padding, &bytes).unwrap()
	}
	pub fn generate_keys(&mut self) {
		info!("Generating keys...");
		let mut rng = rand::thread_rng();

		let bits = 2048;
		let private_key = RsaPrivateKey::new(&mut rng, bits).expect("failed to generate a key");
		let public_key = RsaPublicKey::from(&private_key);
		self.public_key = Some(public_key);
		self.private_key = Some(private_key);
		info!("Keys generated");
	}

	fn emit_event(handle: AppHandle, event: webview_packets::Auth) -> Result<(), tauri::Error> {
		debug!("emiting {:?}", event.clone());
		handle.emit_all("auth", event)?;

		Ok(())
	}

	async fn send_init(
		connection_info: &mut ConnectionInfo<MobileAuthConnectionData>,
		client: Arc<
			tokio::sync::Mutex<
				futures_util::stream::SplitSink<
					WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
					tokio_tungstenite::tungstenite::Message
				>
			>
		>
	) {
		let public_key = &connection_info.aditional_data.public_key;
		let public_key_base64 = general_purpose::STANDARD.encode(&public_key.to_public_key_der().unwrap());
		let t = serde_json
			::to_string(
				&(mobile_auth_packets::Packets::Init {
					encoded_public_key: public_key_base64.clone(),
				})
			)
			.unwrap();
		println!("{}", t);
		let mut client = client.lock().await;
		client
			.send(
				Message::Text(
					serde_json
						::to_string(
							&(mobile_auth_packets::Packets::Init {
								encoded_public_key: public_key_base64.clone(),
							})
						)
						.unwrap()
				)
			).await
			.unwrap();
	}

	async fn handle_once_proof(
		additional_data: &mut MobileAuthConnectionData,
		client: Arc<
			tokio::sync::Mutex<
				futures_util::stream::SplitSink<
					WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
					tokio_tungstenite::tungstenite::Message
				>
			>
		>,
		encrypted_nonce: String
	) -> Result<(), Box<dyn std::error::Error>> {
		let bytes = general_purpose::STANDARD.decode(encrypted_nonce.as_bytes()).unwrap();

		let data = additional_data.decrypt(bytes)?;

		use sha2::Digest;
		println!("data {:?}", general_purpose::STANDARD.encode(&data));
		let mut hasher = sha2::Sha256::new();
		hasher.update(data);
		let result = hasher.finalize();
		let base64 = general_purpose::URL_SAFE_NO_PAD.encode(&result);

		println!("{:?}", base64);
		let mut client = client.lock().await;
		client
			.send(
				Message::Text(
					serde_json
						::to_string(
							&(mobile_auth_packets::Packets::NonceProof {
								proof: base64.clone(),
							})
						)
						.unwrap()
				)
			).await
			.unwrap();
		println!("Sent proof");
		Ok(())
	}

	//todo add error handling
	async fn get_token(
		connection_info: &mut ConnectionInfo<MobileAuthConnectionData>,
		ticket: String
	) -> Result<String, GetTokenResponse> {
		let client = reqwest::Client::new();
		let res = client
			.post(constants::MOBILE_AUTH_GET_TOKEN)
			.header("Content-Type", "application/json")
			.body(serde_json::to_string(&(http_packets::Auth::Login { ticket: ticket })).unwrap())
			.send().await
			.unwrap();

		let json = res.json::<http_packets::Auth>().await.unwrap();
		match json {
			http_packets::Auth::LoginResponse { encrypted_token } => {
				let bytes = general_purpose::STANDARD.decode(encrypted_token.as_bytes()).unwrap();
				let token = String::from_utf8(connection_info.aditional_data.decrypt(bytes).unwrap()).unwrap();
				Ok(token)
			}
			Auth::Error { code, errors, message } => {
				error!("{} {} {}", code, errors, message);
				Err(GetTokenResponse::Other(message))
			}
			Auth::RequireAuth { captcha_key, captcha_rqdata, captcha_rqtoken, captcha_service, captcha_sitekey } => {
				info!("MobileAuth RequireAuth");
				Err(GetTokenResponse::RequireAuth {
					captcha_key: captcha_key.clone(),
					captcha_sitekey: captcha_sitekey.clone(),
					captcha_service,
					captcha_rqdata,
					captcha_rqtoken,
				})
			}
			_ => {
				error!("Unknown");
				Err(GetTokenResponse::Other("Unknown".to_string()))
			}
		}
	}

	fn on_token_error(&self, err: GetTokenResponse, ticket: String) -> bool {
		match err {
			GetTokenResponse::Other(m) => {
				println!("Error: {}", m);
				//self.emit_event(webview_packets::Auth::MobileAuthError { error: m }).unwrap();
				return true;
			}
			GetTokenResponse::RequireAuth {
				captcha_key,
				captcha_sitekey,
				captcha_service,
				captcha_rqdata,
				captcha_rqtoken,
			} => {
				let site_key = captcha_sitekey.clone();
				if
					let StateOld::LoginScreen {
						captcha_sitekey: ref mut captcha_key,
						ticket: ref mut new_ticket,
						captcha_rqtoken: ref mut new_captcha_rqtoken,
						..
					} = *self.app_state.state_old.lock().unwrap()
				{
					*captcha_key = site_key;
					*new_ticket = Some(ticket);
					*new_captcha_rqtoken = captcha_rqtoken;
				}
				println!("Captcha: {:?}", captcha_rqdata);
				// self.emit_event(webview_packets::Auth::RequireAuthMobile {
				// 	captcha_key,
				// 	captcha_sitekey,
				// 	captcha_service,
				// }).unwrap();
			}
		}
		false
	}

	pub async fn run(&mut self) {
		// loop {
		// 	let res = self.connect_old().await;
		// 	if let Ok(res) = res {
		// 		if matches!(res, GatewayResult::Close) {
		// 			break;
		// 		}
		// 	} else {
		// 		println!("Error: {:?}", res);
		// 		tokio::time::sleep(Duration::from_millis(10000)).await;
		// 	}

		// 	info!("Reconnecting");
		// }
		info!("shutting down mobile auth")
	}

	async fn handle_events(
		connection_info: &Arc<tokio::sync::Mutex<ConnectionInfo<MobileAuthConnectionData>>>,
		client: Arc<
			tokio::sync::Mutex<
				futures_util::stream::SplitSink<
					WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
					tokio_tungstenite::tungstenite::Message
				>
			>
		>,
		event: Packets
	) -> Result<GatewayResult, GatewayError> {
		let mut connection_info = connection_info.lock().await;
		match event {
			Packets::HeartbeatAck {} => {
				connection_info.ack_recived = true;
			}
			Packets::Hello { heartbeat_interval, timeout_ms } => {
				connection_info.heartbeat_interval = Duration::from_millis(heartbeat_interval);
				connection_info.timeout_ms = timeout_ms;
				Self::send_init(&mut *connection_info, client).await;

				connection_info.start_hearbeat.notify_waiters();
			}
			Packets::NonceProofServer { encrypted_nonce } => {
				Self::handle_once_proof(&mut connection_info.aditional_data, client, encrypted_nonce).await;
			}
			Packets::PendingRemoteInit { fingerprint } => {
				println!("Fingerprint: {}", fingerprint);
				let new_qr_url = format!("https://discordapp.com/ra/{}", fingerprint);
				Self::emit_event(connection_info.handle.clone(), webview_packets::Auth::MobileQrcode {
					qrcode: Some(new_qr_url.clone()),
				}).unwrap();
				//todo send to module manager
				// let mut state = self.app_state.state.lock().unwrap();
				// match *state {
				// 	State::LoginScreen { ref mut qr_url, .. } => {
				// 		*qr_url = Some(new_qr_url);
				// 	}
				// 	_ => {}
				// }
				// println!("state: {:?}", state);
			}
			Packets::PendingTicket { encrypted_user_payload } => {
				println!("Ticket: {}", encrypted_user_payload);
				let decrypted = general_purpose::STANDARD.decode(encrypted_user_payload.as_bytes()).unwrap();
				let decrypted = connection_info.aditional_data.decrypt(decrypted).unwrap();
				//split decrypted :
				let string = String::from_utf8(decrypted).unwrap();
				let splited = string.split(':').collect::<Vec<&str>>();
				println!("{:?}", string);
				//self.user_id = Some(splited[0].to_string());
				Self::emit_event(connection_info.handle.clone(), webview_packets::Auth::MobileTicketData {
					user_id: splited[0].to_string(),
					discriminator: splited[1].to_string(),
					avatar_hash: splited[2].to_string(),
					username: splited[3].to_string(),
				}).unwrap();
			}
			Packets::PendingLogin { ticket } => {
				match Self::get_token(&mut *connection_info, ticket.clone()).await {
					Ok(token) => {
						// if let Some(user_id) = self.user_id.as_ref() {
						// todo send info to Main State

						// 	self.app_state.add_new_user(user_id.clone(), token);

						// 	self.emit_event(webview_packets::Auth::LoginSuccess {
						// 		user_id: user_id.clone(),
						// 		user_settings: None,
						// 	}).unwrap();
						// }
						return Ok(GatewayResult::Close);
					}
					Err(message) => {
						//todo on error
						// if self.on_token_error(message, ticket.clone()) {
						// 	return Ok(GatewayResult::Reconnect);
						// }
					}
				}
				return Ok(GatewayResult::Close);
			}
			Packets::Cancel {} => todo!(),
			_ => {}
		}
		Ok(GatewayResult::Continue)
	}

	async fn read_thread(
		mut reader: SplitStream<WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>>,
		writer: Arc<
			tokio::sync::Mutex<
				SplitSink<
					WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
					tokio_tungstenite::tungstenite::Message
				>
			>
		>,
		connection_info: Arc<tokio::sync::Mutex<ConnectionInfo<MobileAuthConnectionData>>>
	) -> std::result::Result<(), Box<dyn std::error::Error>> {
		let stop = {
			let connection_info = connection_info.lock().await;
			connection_info.stop.clone()
		};
		loop {
			let message = reader.next().await.unwrap().unwrap();

			print!("{:?}", message);

			match message {
				Message::Text(message) => {
					let event = serde_json::from_str::<Packets>(&message).unwrap();
					let result = Self::handle_events(&connection_info, writer.clone(), event).await;
					if let Ok(result) = result {
						if !matches!(result, GatewayResult::Continue) {
							//return Ok(result);
						}
					} else {
						//return result;
					}
				}
				Message::Close(frame) => {
					error!("close frame {:?}", frame);
					//return Ok(GatewayResult::Reconnect);
				}
				_ => {
					warn!("unknown message {:?}", message);
				}
			}

			//...
		}
	}

	async fn heartbeat_thread(
		connection_info: Arc<tokio::sync::Mutex<ConnectionInfo<MobileAuthConnectionData>>>,
		writer: Arc<
			tokio::sync::Mutex<
				SplitSink<
					WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
					tokio_tungstenite::tungstenite::Message
				>
			>
		>
	) {
		let start_thread = {
			let connection_info = connection_info.lock().await;
			connection_info.start_hearbeat.clone()
		};
		start_thread.notified().await;

		let connection_info = connection_info.lock().await;
		let mut ticker = tokio::time::interval(connection_info.heartbeat_interval);
		loop {
			let mut writer = writer.lock().await;

			writer.send(Message::Text(serde_json::to_string(&(Packets::Heartbeat {})).unwrap())).await.unwrap();

			ticker.tick().await;
		}
	}

	pub async fn connect(
		&mut self,
		handle: AppHandle
	) -> std::result::Result<tokio::sync::broadcast::Receiver<()>, Box<dyn std::error::Error>> {
		let (tx, _) = tokio::sync::broadcast::channel::<()>(1);
		self.stop = Some(tx.clone());

		let connection_info = Arc::new(
			tokio::sync::Mutex::new(
				ConnectionInfo::new(
					MobileAuthConnectionData {
						public_key: self.public_key.clone().unwrap(),
						private_key: self.private_key.clone().unwrap(),
					},
					tx.clone(),
					handle
				)
			)
		);

		let req = tokio_tungstenite::tungstenite::handshake::client::Request
			::builder()
			.method("GET")
			.header("Host", "remote-auth-gateway.discord.gg")
			.header("Connection", "Upgrade")
			.header("Upgrade", "websocket")
			.header("Sec-WebSocket-Version", "13")
			.header("Sec-WebSocket-Key", tokio_tungstenite::tungstenite::handshake::client::generate_key())
			.uri(constants::MOBILE_AUTH)
			.header("Origin", "https://discord.com")
			.body(())
			.unwrap();
		let (stream, _) = connect_async_tls_with_config(req, None, None).await?;

		let (write, read) = stream.split();

		let write = Arc::new(tokio::sync::Mutex::new(write));

		let (error_sender, error_reciver) = tokio::sync::broadcast::channel::<()>(1);

		{
			let error_sender = error_sender.clone();
			let mut stop_reciver = tx.subscribe();
			let stop_sender = tx.clone();
			let write = write.clone();
			let connection_info = connection_info.clone();
			tokio::spawn(async move {
				tokio::select! {
                    _ = stop_reciver.recv() => {
                        println!("Stopping Read");
                    }
                    _ = Self::read_thread(read,write,connection_info) => {
                        println!("Reconnecting");
                        //todo send error
                        let _ = stop_sender.send(());
                        let _  = error_sender.send(());
                    }
                }
			});
		}

		{
			let error_sender = error_sender.clone();
			let mut stop_reciver = tx.subscribe();
			let stop_sender = tx.clone();
			let write = write.clone();
			let connection_info = connection_info.clone();
			tokio::spawn(async move {
				tokio::select! {
                    _ = stop_reciver.recv() => {
                        println!("Stopping HeartBeat");
                    }
                    _ = Self::heartbeat_thread(connection_info,write) => {
                        println!("Reconnectiong");
                        //todo send error
                        stop_sender.send(()).unwrap();
                        error_sender.send(()).unwrap();
                    }
                }
			});
		}
		return Ok(error_reciver);
	}
}
