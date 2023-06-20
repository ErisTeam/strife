use std::{ sync::Arc, time::Duration, error::Error, fmt::Display };

use base64::{ engine::general_purpose, Engine };
use futures_util::{ StreamExt, stream::{ SplitStream, SplitSink }, SinkExt };
use log::{ error, debug };
use rsa::{ RsaPublicKey, RsaPrivateKey, PaddingScheme, pkcs8::EncodePublicKey };
use sha2::{ Sha256, Digest };
use tauri::AppHandle;
use tokio::{ net::TcpStream, sync::{ Mutex } };
use tokio_tungstenite::{ MaybeTlsStream, connect_async_tls_with_config, WebSocketStream };

use crate::discord::{ constants, mobile_auth_packets::{ OutGoingPackets, IncomingPackets } };

use super::{ gateway_utils::ConnectionInfo, auth::Cos };

#[derive(Debug, Clone)]
pub enum Errors {
	/// login request cancelled
	Cancelled,
	ReadError,
}
impl Display for Errors {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		match self {
			Self::Cancelled => write!(f, "login request cancelled"),
			Self::ReadError => write!(f, "read error"),
		}
	}
}
impl Error for Errors {}

pub struct MobileAuthConnectionData {
	pub public_key: RsaPublicKey,
	private_key: RsaPrivateKey,
	auth_sender: tokio::sync::mpsc::Sender<Cos>,
}
impl MobileAuthConnectionData {
	fn decrypt(&self, bytes: Vec<u8>) -> Result<Vec<u8>, rsa::errors::Error> {
		let padding = PaddingScheme::new_oaep::<sha2::Sha256>();
		self.private_key.decrypt(padding, &bytes)
	}

	fn tak(&self, data: String) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
		let decoded = base64::engine::general_purpose::STANDARD.decode(&data)?;
		return Ok(self.decrypt(decoded)?);
	}
}

#[derive(Debug)]
pub struct MobileAuth {
	stop_notifyer: Option<Arc<tokio::sync::Notify>>,
}
impl MobileAuth {
	pub fn new() -> Self {
		Self {
			stop_notifyer: None,
		}
	}

	async fn connect(
		&self
	) -> Result<WebSocketStream<MaybeTlsStream<TcpStream>>, tokio_tungstenite::tungstenite::Error> {
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
			.body(())?;
		let (stream, _) = connect_async_tls_with_config(req, None, false, None).await?;
		Ok(stream)
	}
	fn generate_keys(&self) -> Result<(RsaPublicKey, RsaPrivateKey), rsa::errors::Error> {
		debug!("Generating keys...");
		let mut rng = rand::thread_rng();

		let bits = 2048;
		let private_key = RsaPrivateKey::new(&mut rng, bits)?;
		let public_key = RsaPublicKey::from(&private_key);

		debug!("Keys generated");
		Ok((public_key, private_key))
	}

	fn create_connection_info(
		&self,
		auth_sender: tokio::sync::mpsc::Sender<Cos>,
		app_handle: AppHandle
	) -> Result<ConnectionInfo<MobileAuthConnectionData>, Box<dyn std::error::Error>> {
		let (public_key, private_key) = self.generate_keys()?;
		Ok(
			ConnectionInfo::new(
				MobileAuthConnectionData {
					public_key,
					private_key,
					auth_sender,
				},

				app_handle
			)
		)
	}

	async fn send_init(
		public_key: &RsaPublicKey,
		client: &mut futures_util::stream::SplitSink<
			WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
			tokio_tungstenite::tungstenite::Message
		>
	) -> Result<(), Box<dyn std::error::Error>> {
		debug!("Sending init packet");
		let encoded_public_key = general_purpose::STANDARD.encode(public_key.to_public_key_der()?);

		let packet = serde_json::to_string(&(OutGoingPackets::Init { encoded_public_key }))?;

		client.send(tokio_tungstenite::tungstenite::Message::Text(packet)).await?;

		Ok(())
	}

	async fn logic_thread(
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
		loop {
			let read = reader.next().await;
			if read.is_none() {
				return Err(Errors::ReadError.into());
			}
			let message = read.unwrap()?;
			println!("{:?}", message);
			match message {
				tokio_tungstenite::tungstenite::Message::Text(data) => {
					let event = serde_json::from_str::<IncomingPackets>(&data)?;
					match event {
						IncomingPackets::Hello { heartbeat_interval, timeout_ms } => {
							debug!("Received hello packet");
							let mut connection_info = connection_info.lock().await;
							connection_info.heartbeat_interval = Duration::from_millis(heartbeat_interval);
							connection_info.timeout_ms = timeout_ms;
							connection_info.start_hearbeat.notify_waiters();

							let public_key = &connection_info.aditional_data.public_key;
							let mut writer = writer.lock().await;
							Self::send_init(public_key, &mut writer).await?;
						}
						IncomingPackets::NonceProof { encrypted_nonce } => {
							debug!("Received nonce proof packet");
							let connection_info = connection_info.lock().await;

							let decrypted = connection_info.aditional_data.tak(encrypted_nonce)?;

							let mut hasher = Sha256::new();
							hasher.update(&decrypted);
							let hash = hasher.finalize();
							let proof = general_purpose::URL_SAFE_NO_PAD.encode(&hash);

							let packet = serde_json::to_string(&(OutGoingPackets::NonceProof { proof }))?;

							let mut client = writer.lock().await;
							debug!("Sending nonce proof packet");
							client.send(tokio_tungstenite::tungstenite::Message::Text(packet)).await?;
						}
						IncomingPackets::HeartbeatAck {} => {
							let mut connection_info = connection_info.lock().await;
							connection_info.ack_recived = true;
							debug!("Received heartbeat ack");
						}
						IncomingPackets::Cancel {} => {
							debug!("Received cancel packet");
							let connection_info = connection_info.lock().await;
							connection_info.aditional_data.auth_sender.send(Cos::CancelQrCode).await?;

							return Err(Errors::Cancelled.into());
						}
						IncomingPackets::PendingRemoteInit { fingerprint } => {
							debug!("Received pending remote init packet");
							let connection_info = connection_info.lock().await;
							connection_info.aditional_data.auth_sender.send(Cos::UpdateQrCode { fingerprint }).await?;
						}
						IncomingPackets::PendingTicket { encrypted_user_payload } => {
							let connection_info = connection_info.lock().await;

							let decrypted = connection_info.aditional_data.tak(encrypted_user_payload)?;

							let user_payload = String::from_utf8(decrypted).unwrap();

							let splited = user_payload
								.split(":")
								.collect::<Vec<&str>>()
								.iter()
								.map(|x| x.to_string())
								.collect::<Vec<_>>();

							let user_id = splited.get(0).unwrap_or(&String::new()).clone();
							let discriminator = splited.get(1).unwrap_or(&String::new()).clone();
							let avatar_hash = splited.get(2).unwrap_or(&String::new()).clone();
							let username = splited.get(3).unwrap_or(&String::new()).clone();

							connection_info.aditional_data.auth_sender.send(Cos::UpdateQrUserData {
								user_id,
								discriminator,
								avatar_hash,
								username,
							}).await?;
						}
						IncomingPackets::PendingLogin { ticket } => {
							let connection_info = connection_info.lock().await;

							let private_key = connection_info.aditional_data.private_key.clone();

							connection_info.aditional_data.auth_sender.send(Cos::Login {
								ticket,
								private_key,
							}).await?;
						}
					}
				}
				tokio_tungstenite::tungstenite::Message::Binary(_) => todo!(),
				tokio_tungstenite::tungstenite::Message::Close(_) => {
					return Err("Connection closed".into());
				}
				_ => {}
			}
		}
	}

	async fn heartbeat_thread(
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
		let should_start = {
			let connection_info = connection_info.lock().await;
			connection_info.start_hearbeat.clone()
		};
		debug!("Waiting for start heartbeat");
		should_start.notified().await;

		let mut interval = {
			let connection_info = connection_info.lock().await;
			tokio::time::interval(connection_info.heartbeat_interval)
		};
		loop {
			interval.tick().await;
			let mut connection_info = connection_info.lock().await;
			if connection_info.ack_recived {
				connection_info.ack_recived = false;
			} else {
				todo!("return error");
			}
			let packet = serde_json::to_string(&(OutGoingPackets::Heartbeat {}))?;

			let mut writer = writer.lock().await;
			writer.send(tokio_tungstenite::tungstenite::Message::Text(packet)).await?;
			debug!("Sent heartbeat packet");
		}
	}

	pub async fn start(
		&mut self,
		handle: AppHandle,
		auth_sender: tokio::sync::mpsc::Sender<Cos>
	) -> std::result::Result<tokio::sync::broadcast::Receiver<String>, Box<dyn std::error::Error>> {
		let (error_sender, error_reciver) = tokio::sync::broadcast::channel::<String>(1);

		let connection_info = Arc::new(Mutex::new(self.create_connection_info(auth_sender, handle)?));

		let stop = connection_info.lock().await.stop.clone();
		self.stop_notifyer = Some(stop.clone());

		let connection = self.connect().await?;

		let (write, read) = connection.split();

		let write = Arc::new(Mutex::new(write));

		{
			let error_sender = error_sender.clone();

			let stop = stop.clone();

			let write = write.clone();
			let connection_info = connection_info.clone();

			tokio::spawn(async move {
				tokio::select! {
                    _ = stop.notified() => {
                        debug!("Stopping logic thread");
                    }
                    e = Self::logic_thread(read,write,connection_info) => {
                        
						if let Err(err) = &e{
							let r = error_sender.send(err.to_string());
							println!("{:?}",r);
							error!("Mobile auth logic thread encountered an error: {:?}",e);
						}
             			
						
					}
				   
                }
			});
		}

		{
			let error_sender = error_sender.clone();

			let stop = stop.clone();

			let write = write.clone();
			let connection_info = connection_info.clone();

			tokio::spawn(async move {
				tokio::select! {
                    _ = stop.notified() => {
                        debug!("Stopping heartbeat thread");
                        
                    }
                    e = Self::heartbeat_thread(write,connection_info) => {
                        debug!("Mobile auth heartbeat thread stopped");
						error!("heartbeat thread encountered an error: {:?}",e);
                        if let Err(e) = e {
                        	let r = error_sender.send(e.to_string());
							println!("sending result: {:?}",r);
						}
						
                    }
                }
			});
		}

		Ok(error_reciver)
	}

	pub fn stop(&self) {
		if let Some(stop_notifyer) = &self.stop_notifyer {
			debug!("Stopping mobile auth");
			stop_notifyer.notify_waiters();
		}
	}
	pub fn stop_notifyer(&self) -> Option<Arc<tokio::sync::Notify>> {
		if let Some(stop_notifyer) = &self.stop_notifyer {
			return Some(stop_notifyer.clone());
		}
		None
	}
}
