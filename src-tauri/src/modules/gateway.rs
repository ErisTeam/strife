use std::{ sync::Arc, io::Write, time::Duration };

use futures_util::{ StreamExt, stream::{ SplitStream, SplitSink }, SinkExt };
use log::{ debug, error, warn, trace };
use tauri::AppHandle;
use tokio::{ net::TcpStream, sync::{ Mutex, RwLock } };
use tokio_tungstenite::{
	WebSocketStream,
	MaybeTlsStream,
	connect_async_tls_with_config,
	tungstenite::{ protocol::frame::coding::CloseCode, Message },
};

use crate::{
	discord::{
		constants,
		gateway_packets::{ OutGoingPacket, IncomingPacket, DispatchedEvents, OutGoingPacketsData },
		types::gateway::gateway_packets_data::{ Identify, LazyGuilds, VoiceStateUpdateSend, Resume },
		user::UserData,
	},
	modules::websocket::WebSocket,
};

use super::{ main_app::GatewayMessages, gateway_utils::Errors };

#[derive(Debug, Clone)]
#[allow(unused)]
pub enum Messages {
	RequestLazyGuilds(LazyGuilds),
	UpdateVoiceState(VoiceStateUpdateSend),
}

type ConnectionInfo = super::gateway_utils::ConnectionInfo<ConnectionData, GatewayMessages>;

pub struct ConnectionData {
	sequence_number: Option<u64>,

	token: String,

	is_recconecting: bool,

	resume_url: Option<String>,

	session_id: Option<String>,
}
impl ConnectionData {
	pub fn new(token: String, is_recconecting: bool) -> Self {
		Self {
			token,
			sequence_number: None,
			resume_url: None,
			session_id: None,
			is_recconecting,
		}
	}
}

#[derive(Debug)]
pub struct Gateway {
	pub stop_notifyer: Option<Arc<tokio::sync::Notify>>,

	#[deprecated]
	resume_url: Option<String>,

	message_sender: Option<tokio::sync::mpsc::Sender<Messages>>, //TODO: add type
}
impl Gateway {
	pub fn new() -> Arc<RwLock<Self>> {
		Arc::new(
			RwLock::new(Self {
				stop_notifyer: None,
				resume_url: None,
				message_sender: None,
			})
		)
	}

	async fn connect(&self, resume_url: &Option<String>) -> crate::Result<Arc<WebSocket>> {
		let url = if let Some(resume_url) = resume_url {
			resume_url.clone()
		} else {
			constants::GATEWAY_CONNECT.to_string()
		};
		println!("Connecting to {}", url);

		// let req = tokio_tungstenite::tungstenite::handshake::client::Request
		// 	::builder()
		// 	.method("GET")
		// 	.header("Host", "remote-auth-gateway.discord.gg")
		// 	.header("Connection", "Upgrade")
		// 	.header("Upgrade", "websocket")
		// 	.header("Sec-WebSocket-Version", "13")
		// 	.header("Sec-WebSocket-Key", tokio_tungstenite::tungstenite::handshake::client::generate_key())
		// 	.uri(url)
		// 	.body(url.split('/').nth(3).unwrap_or_default().to_string())?
		// 	.header("Origin", "https://discord.com")
		// 	.body(())?;
		let websocket = WebSocket::new(url).await?;
		Ok(Arc::new(websocket))
	}

	fn create_connection_info(
		&self,
		sender: tokio::sync::mpsc::Sender<GatewayMessages>,
		app_handle: AppHandle,
		token: String,
		is_recconecting: bool
	) -> crate::Result<ConnectionInfo> {
		Ok(ConnectionInfo::new(ConnectionData::new(token, is_recconecting), app_handle, sender))
	}

	async fn logic_thread(
		websocket: Arc<WebSocket>,
		connection_info: Arc<tokio::sync::Mutex<ConnectionInfo>>
	) -> std::result::Result<(), Box<dyn std::error::Error>> {
		let mut message_buffer = Vec::<u8>::new();
		let mut decoder = flate2::Decompress::new(true);
		let reader = websocket.reader().await;
		loop {
			let message = reader.lock().await.next().await.ok_or(Errors::ReadError)??;

			match message {
				tokio_tungstenite::tungstenite::Message::Binary(payload) => {
					message_buffer.extend(payload);

					if message_buffer[message_buffer.len() - 4..] != [0, 0, 255, 255] {
						continue;
					}
					let mut decompressed_buf = Vec::with_capacity(20_971_520); // 20mb
					decoder.decompress_vec(&message_buffer, &mut decompressed_buf, flate2::FlushDecompress::Sync)?;

					let packet = if cfg!(debug_assertions) {
						let time = chrono::Local::now().format("%y-%b-%d %H.%M.%S.%f");

						let packet = serde_json::from_slice::<IncomingPacket>(&decompressed_buf);
						let r#type;
						if let Ok(packet) = &packet {
							r#type = packet.data.to_string();
						} else {
							error!("Failed to parse: {:?}", packet);
							r#type = "Failed to parse".to_string();
						}
						let connection_info = connection_info.lock().await;

						let p = connection_info.handle.path_resolver().app_data_dir().unwrap();
						//    println!("{:?}", p);
						let mut file = std::fs::File
							::create(p.join(format!("gateway logs/{} {}.json", r#type, time)))
							.unwrap();
						file.write_all(&decompressed_buf).unwrap();
						if packet.is_ok() {
							packet.unwrap()
						} else {
							message_buffer.clear();
							continue;
						}
					} else {
						serde_json::from_slice::<IncomingPacket>(&decompressed_buf)?
					};
					message_buffer.clear();
					{
						let mut connection_info = connection_info.lock().await;
						connection_info.aditional_data.sequence_number = packet.sequence_number;
					}
					match packet.data {
						crate::discord::gateway_packets::IncomingPacketsData::Hello(data) => {
							let mut connection_info = connection_info.lock().await;
							connection_info.heartbeat_interval = Duration::from_millis(data.heartbeat_interval);

							connection_info.start_heartbeat();

							let p = OutGoingPacket::identify(Identify {
								token: connection_info.aditional_data.token.clone(),
								..Default::default()
							});
							// println!("leaves {:?}", p);
							// println!("House {:?}", serde_json::to_string(&p)?);

							websocket.send(
								tokio_tungstenite::tungstenite::Message::Text(serde_json::to_string(&p)?)
							).await?;
							println!("Identify sent");
						}
						crate::discord::gateway_packets::IncomingPacketsData::Heartbeat(_) => {
							let connection_info = connection_info.lock().await;

							websocket.send(
								tokio_tungstenite::tungstenite::Message::Text(
									serde_json::to_string(
										&OutGoingPacket::heartbeat(connection_info.aditional_data.sequence_number)
									)?
								)
							).await?;
						}
						crate::discord::gateway_packets::IncomingPacketsData::HeartbeatAck => {
							let mut connection_info = connection_info.lock().await;
							connection_info.ack_recived = true;
						}

						crate::discord::gateway_packets::IncomingPacketsData::DispatchedEvent(data) => {
							let mut connection_info = connection_info.lock().await;
							match data {
								crate::discord::gateway_packets::DispatchedEvents::ReadySupplemental(_) => {
									//TODO: implement
								}
								crate::discord::gateway_packets::DispatchedEvents::SessionReplace(_) => {
									//TODO: implement
								}
								crate::discord::gateway_packets::DispatchedEvents::MessageDelete(_) => {
									//TODO: Message delete
								}
								crate::discord::gateway_packets::DispatchedEvents::StartTyping(data) => {
									println!("Start typing {:?}", data);
									//TODO: implement
								}
								crate::discord::gateway_packets::DispatchedEvents::BurstCreditBalanceUpdate(_) => {
									//TODO: Burst credit balance update
								}
								crate::discord::gateway_packets::DispatchedEvents::Unknown(value) => {
									println!("Unknown packet {:?}", value);
								}
								DispatchedEvents::Ready(data) => {
									connection_info.aditional_data.resume_url = Some(data.resume_gateway_url.clone());
									connection_info.aditional_data.session_id = Some(data.session_id.clone());

									connection_info.sender.send(GatewayMessages::Ready(UserData::from(data))).await?;
								}
								data => connection_info.sender.send(GatewayMessages::from(data)).await?,
							}
						}
						crate::discord::gateway_packets::IncomingPacketsData::Reconnect => {
							//TODO: implement
							let connection_info = connection_info.lock().await;

							websocket.reconnect(connection_info.aditional_data.resume_url.clone()).await?;

							let session_id = connection_info.aditional_data.session_id.as_ref().unwrap().clone(); //TODO: check if None possible
							let last_sequece_number = connection_info.aditional_data.sequence_number
								.as_ref()
								.unwrap()
								.clone(); //TODO: check if None possible

							let packet = OutGoingPacket::new(
								OutGoingPacketsData::Resume(Resume {
									token: connection_info.aditional_data.token.clone(),
									session_id,
									last_seq: last_sequece_number,
								})
							)?.to_json()?;

							websocket.send(Message::Text(packet)).await?;

							debug!("Reconnecting");
						}
					}
				}

				tokio_tungstenite::tungstenite::Message::Close(frame) => {
					println!("aaaaaaaaaaaaaaaaaaaaa {:?}",frame);
					if let Some(frame) = frame {
						match frame.code {
							CloseCode::Library(code) => {
								//TODO: implement
								debug!("Reconnecting because of close code {:?}", code);
								websocket.reconnect(None).await?;
							}
							code => {
								debug!("Reconnecting because of close code {:?}", code);
								websocket.reconnect(None).await?;
							}
						}
					}
					
					return Err("Connection closed".into());
				}
				_ => {}
			}
		}
	}

	async fn heartbeat_thread(
		websocket: Arc<WebSocket>,
		connection_info: Arc<tokio::sync::Mutex<ConnectionInfo>>
	) -> std::result::Result<(), Box<dyn std::error::Error>> {
		let should_start = {
			let connection_info = connection_info.lock().await;
			connection_info.hearbeat_notify.clone()
		};
		debug!("Waiting for start heartbeat");
		should_start.notified().await;
		debug!("Starting heartbeat");

		let heartbeat_interval = {
			let connection_info = connection_info.lock().await;
			connection_info.heartbeat_interval
		};

		let mut interval = { tokio::time::interval(heartbeat_interval) };
		loop {
			interval.tick().await;
			let mut connection_info = connection_info.lock().await;
			if connection_info.ack_recived {
				connection_info.ack_recived = false;
			} else {
				warn!("Heartbeat ack not recived");
				//todo!("return error");
			}
			if heartbeat_interval != connection_info.heartbeat_interval {
				interval = tokio::time::interval(connection_info.heartbeat_interval);
				continue;
			}

			let sequence_number = connection_info.aditional_data.sequence_number;

			let packet = serde_json::to_string(&OutGoingPacket::heartbeat(sequence_number))?;

			websocket.send(tokio_tungstenite::tungstenite::Message::Text(packet)).await?;
			trace!("Sent heartbeat packet");
		}
	}
	#[allow(unused)]
	async fn message_thread(
		mut message_receiver: tokio::sync::mpsc::Receiver<Messages>,
		websocket: Arc<WebSocket>,
		connection_info: Arc<tokio::sync::Mutex<ConnectionInfo>>
	) -> crate::Result<()> {
		loop {
			let res = message_receiver.recv().await;
			if res.is_none() {
				return Ok(());
			}
			let message = res.unwrap();
			match message {
				Messages::RequestLazyGuilds(payload) => {
					let payload = OutGoingPacket::lazy_guilds(payload).to_json()?;
					websocket.send(tokio_tungstenite::tungstenite::Message::Text(payload)).await?;
				}
				Messages::UpdateVoiceState(payload) => {
					let payload = OutGoingPacket::voice_state_update(payload).to_json()?;
					websocket.send(tokio_tungstenite::tungstenite::Message::Text(payload)).await?;
				}
			}
		}
	}

	pub async fn start(
		&mut self,
		handle: AppHandle,
		sender: tokio::sync::mpsc::Sender<GatewayMessages>,
		token: String
	) -> crate::Result<tokio::sync::broadcast::Receiver<String>> {
		let (error_sender, error_reciver) = tokio::sync::broadcast::channel::<String>(1);

		let (message_sender, message_reciver) = tokio::sync::mpsc::channel::<Messages>(1);

		let websocket = self.connect(&self.resume_url).await?;

		let connection_info = Arc::new(Mutex::new(self.create_connection_info(sender, handle, token, false)?));

		let stop = connection_info.lock().await.stop.clone();
		self.stop_notifyer = Some(stop.clone());
		self.message_sender = Some(message_sender);

		{
			let error_sender = error_sender.clone();

			let stop = stop.clone();

			let websocket = websocket.clone();
			let connection_info = connection_info.clone();

			tokio::spawn(async move {
				tokio::select! {
                    _ = stop.notified() => {
                        debug!("Stopping Logic Thread");
                    }
                    e = Self::logic_thread(websocket,connection_info) => {
                        
						if let Err(err) = &e{
							let r = error_sender.send(err.to_string());
							println!("{:?}",r);
							error!("Gateway logic thread encountered an error: {:?}",e);
						}
					}
				   
                }
			});
		}

		{
			let error_sender = error_sender.clone();

			let stop = stop.clone();

			let websocket = websocket.clone();
			let connection_info = connection_info.clone();

			tokio::spawn(async move {
				tokio::select! {
                    _ = stop.notified() => {
                        debug!("Stopping heartbeat thread");
                        
                    }
                    e = Self::heartbeat_thread(websocket,connection_info) => {
						error!("heartbeat thread encountered an error: {:?}",e);
                        if let Err(e) = e {
                        	let r = error_sender.send(e.to_string());
							println!("sending result: {:?}",r);
						}
						
                    }
                }
			});
		}

		{
			let error_sender = error_sender.clone();

			let stop = stop.clone();

			let websocket = websocket.clone();
			let connection_info = connection_info.clone();

			tokio::spawn(async move {
				tokio::select! {
                    _ = stop.notified() => {
                        debug!("Stopping message thread");
                        
                    }
                    e = Self::message_thread(message_reciver,websocket,connection_info) => {
						error!("message thread encountered an error: {:?}",e);
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
		if let Some(notifyer) = &self.stop_notifyer {
			notifyer.notify_waiters();
		}
	}
	#[allow(dead_code)]
	pub async fn send_message(&self, message: Messages) -> crate::Result<()> {
		if let Some(sender) = &self.message_sender {
			sender.send(message).await?;
		} else {
			return Err("Message sender is not initialized".into());
		}
		Ok(())
	}
}
