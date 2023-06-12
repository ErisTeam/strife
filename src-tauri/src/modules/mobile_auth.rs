use std::{ sync::Arc, time::Duration, error::Error, fmt::Display };

use base64::{ engine::general_purpose, Engine };
use futures_util::{ StreamExt, stream::{ SplitStream, SplitSink }, SinkExt };
use log::info;
use rsa::{ RsaPublicKey, RsaPrivateKey, PaddingScheme, pkcs8::EncodePublicKey };
use sha2::{ Sha256, Digest };
use tauri::AppHandle;
use tokio::{ net::TcpStream, sync::Mutex };
use tokio_tungstenite::{ MaybeTlsStream, connect_async_tls_with_config, WebSocketStream };

use crate::discord::{ constants, mobile_auth_packets::{ Packets, IncomingPackets } };

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
	async fn send_to_auth(&self, data: Cos) -> Result<(), tokio::sync::mpsc::error::SendError<Cos>> {
		self.auth_sender.send(data).await
	}
}

#[derive(Debug)]
pub struct MobileAuth {
	stop_sender: Option<tokio::sync::broadcast::Sender<()>>,
}
impl MobileAuth {
	pub fn new() -> Self {
		Self {
			stop_sender: None,
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
		let (stream, _) = connect_async_tls_with_config(req, None, None).await?;
		Ok(stream)
	}
	fn generate_keys(&self) -> Result<(RsaPublicKey, RsaPrivateKey), rsa::errors::Error> {
		info!("Generating keys...");
		let mut rng = rand::thread_rng();

		let bits = 2048;
		let private_key = RsaPrivateKey::new(&mut rng, bits)?;
		let public_key = RsaPublicKey::from(&private_key);

		info!("Keys generated");
		Ok((public_key, private_key))
	}

	fn create_connection_info(
		&self,
		stop: tokio::sync::broadcast::Sender<()>,
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
				stop,
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
		let encoded_public_key = general_purpose::STANDARD.encode(public_key.to_public_key_der()?);

		let packet = serde_json::to_string(&(Packets::Init { encoded_public_key }))?;

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
		let stop = {
			let connection_info = connection_info.lock().await;
			connection_info.stop.clone()
		};
		loop {
			let read = reader.next().await;
			if read.is_none() {
				return Err(Errors::ReadError.into());
			}
			let message = read.unwrap()?;
			match message {
				tokio_tungstenite::tungstenite::Message::Text(data) => {
					let event = serde_json::from_str::<IncomingPackets>(&data)?;
					match event {
						IncomingPackets::Hello { heartbeat_interval, timeout_ms } => {
							let mut connection_info = connection_info.lock().await;
							connection_info.heartbeat_interval = Duration::from_millis(heartbeat_interval);
							connection_info.timeout_ms = timeout_ms;
							connection_info.start_hearbeat.notify_waiters();

							let public_key = &connection_info.aditional_data.public_key;
							let mut writer = writer.lock().await;
							Self::send_init(public_key, &mut writer).await?;
						}
						IncomingPackets::NonceProof { encrypted_nonce } => {
							let connection_info = connection_info.lock().await;

							let decoded = general_purpose::STANDARD.decode(&encrypted_nonce)?;
							let decrypted = connection_info.aditional_data.decrypt(decoded)?;

							let mut hasher = Sha256::new();
							hasher.update(&decrypted);
							let hash = hasher.finalize();
							let proof = general_purpose::STANDARD.encode(&hash);

							let packet = serde_json::to_string(&(Packets::NonceProof { proof }))?;

							let mut client = writer.lock().await;
							client.send(tokio_tungstenite::tungstenite::Message::Text(packet)).await?;
						}
						IncomingPackets::HeartbeatAck {} => {
							let mut connection_info = connection_info.lock().await;
							connection_info.ack_recived = true;
						}
						IncomingPackets::Cancel {} => {
							return Err(Errors::Cancelled.into());
						}
						IncomingPackets::PendingRemoteInit { fingerprint } => {
							todo!("send to auth");
						}
						IncomingPackets::PendingTicket { encrypted_user_payload } => {
							todo!("send to auth");
						}
						IncomingPackets::PendingLogin { ticket } => {
							todo!("send to auth");
						}
					}
				}
				tokio_tungstenite::tungstenite::Message::Binary(_) => todo!(),
				tokio_tungstenite::tungstenite::Message::Close(_) => todo!(),
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
			let packet = serde_json::to_string(&(Packets::Heartbeat {}))?;

			let mut writer = writer.lock().await;
			writer.send(tokio_tungstenite::tungstenite::Message::Text(packet)).await?;
		}
	}

	pub async fn start(
		&mut self,
		handle: AppHandle,
		auth_sender: tokio::sync::mpsc::Sender<Cos>
	) -> std::result::Result<tokio::sync::broadcast::Receiver<()>, Box<dyn std::error::Error>> {
		let (error_sender, error_reciver) = tokio::sync::broadcast::channel::<()>(1);
		let (stop_sender, stop_receiver) = tokio::sync::broadcast::channel(1);
		self.stop_sender = Some(stop_sender.clone());

		let connection_info = Arc::new(
			Mutex::new(self.create_connection_info(stop_sender.clone(), auth_sender, handle)?)
		);

		let connection = self.connect().await?;

		let (write, read) = connection.split();

		let write = Arc::new(Mutex::new(write));

		{
			let error_sender = error_sender.clone();

			let stop_sender = stop_sender.clone();
			let mut stop_receiver = stop_sender.subscribe();

			let write = write.clone();
			let connection_info = connection_info.clone();

			tokio::spawn(async move {
				tokio::select! {
                    _ = stop_receiver.recv() => {
                        info!("Stopping mobile auth");
                        stop_sender.send(()).unwrap();
                    }
                    _ = Self::logic_thread(read,write,connection_info) => {
                        info!("Mobile auth logic thread stopped");
                        let _ = stop_sender.send(());
                        let _ = error_sender.send(());
                    }
                }
			});
		}

		{
			let error_sender = error_sender.clone();

			let stop_sender = stop_sender.clone();
			let mut stop_receiver = stop_sender.subscribe();

			let write = write.clone();
			let connection_info = connection_info.clone();

			tokio::spawn(async move {
				tokio::select! {
                    _ = stop_receiver.recv() => {
                        info!("Stopping mobile auth");
                        stop_sender.send(()).unwrap();
                    }
                    _ = Self::heartbeat_thread(write,connection_info) => {
                        info!("Mobile auth logic thread stopped");
                        let _ = stop_sender.send(());
                        let _ = error_sender.send(());
                    }
                }
			});
		}

		Ok(error_reciver)
	}

	pub fn stop(&self) {
		if let Some(stop_sender) = &self.stop_sender {
			let _ = stop_sender.send(());
		}
	}
}
