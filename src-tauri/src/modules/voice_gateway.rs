use std::{ sync::Arc, time::SystemTime };

use futures_util::{ StreamExt, stream::{ SplitSink, SplitStream }, SinkExt };
use log::{ debug, error, warn, trace };
use tauri::{ AppHandle, Manager };
use tokio::{ sync::{ RwLock, Mutex }, net::TcpStream };
use tokio_tungstenite::{ connect_async_tls_with_config, WebSocketStream, MaybeTlsStream };

use crate::{
	discord::{
		voice_gateway_packets::{ OutGoingPacket, OutGoingPacketsData, IncomingPacket },
		types::gateway::voice_gateway_packets_data::{ Heartbeat, Identify },
		constants,
	},
	webview_packets,
};

use super::{ main_app::VoiceGatewayMessages, gateway_utils::Errors };

type ConnectionInfo = super::gateway_utils::ConnectionInfo<ConnectionData, VoiceGatewayMessages>;

pub struct ConnectionData {
	voice_token: String,

	guild_id: String,
	user_id: String,
	session_id: String,
}
impl ConnectionData {
	pub fn new(voice_token: String, guild_id: String, user_id: String, session_id: String) -> Self {
		Self {
			voice_token,
			guild_id,
			user_id,
			session_id,
		}
	}
}

#[derive(Debug)]
pub struct VoiceGateway {
	pub stop_notifyer: Option<Arc<tokio::sync::Notify>>,

	message_sender: Option<tokio::sync::mpsc::Sender<VoiceGatewayMessages>>,
}

impl VoiceGateway {
	pub fn new() -> Self {
		Self {
			stop_notifyer: None,
			message_sender: None,
		}
	}
	pub fn stop(&mut self) {
		if let Some(notifyer) = self.stop_notifyer.take() {
			notifyer.notify_waiters();
		}
	}
	#[allow(dead_code)]
	pub async fn send_message(&self, message: VoiceGatewayMessages) -> crate::Result<()> {
		if let Some(sender) = &self.message_sender {
			sender.send(message).await?;
		} else {
			return Err("Message sender is not initialized".into());
		}
		Ok(())
	}

	fn create_connection_info(
		&self,
		sender: tokio::sync::mpsc::Sender<VoiceGatewayMessages>,
		app_handle: AppHandle,
		voice_token: String,
		guild_id: String,
		user_id: String,
		session_id: String
	) -> ConnectionInfo {
		ConnectionInfo::new(ConnectionData { voice_token, session_id, guild_id, user_id }, app_handle, sender)
	}

	pub async fn connect(
		&self,
		endpoint: String
	) -> Result<WebSocketStream<MaybeTlsStream<TcpStream>>, tokio_tungstenite::tungstenite::Error> {
		println!("wss://{}?v={}", endpoint, constants::VOICE_VERSION);
		let (stream, _) = connect_async_tls_with_config(
			format!("wss://{}/?v={}", endpoint, constants::VOICE_VERSION),
			None,
			false,
			None
		).await?;
		Ok(stream)
	}

	pub async fn start(
		&mut self,
		endpoint: String,
		handle: AppHandle,
		sender: tokio::sync::mpsc::Sender<VoiceGatewayMessages>,
		voice_token: String,
		guild_id: String,
		user_id: String,
		session_id: String
	) -> crate::Result<tokio::sync::broadcast::Receiver<String>> {
		let (error_sender, error_reciver) = tokio::sync::broadcast::channel::<String>(1);

		let (message_sender, message_reciver) = tokio::sync::mpsc::channel::<VoiceGatewayMessages>(5);

		println!("Connecting to: {}", endpoint);
		let connection = self.connect(endpoint).await?;
		println!("Connected");

		let (write, read) = connection.split();

		let write = Arc::new(Mutex::new(write));

		let connection_info = Arc::new(
			Mutex::new(self.create_connection_info(sender, handle, voice_token, guild_id, user_id, session_id))
		);

		let stop = connection_info.lock().await.stop.clone();
		self.stop_notifyer = Some(stop.clone());
		self.message_sender = Some(message_sender);

		{
			let error_sender = error_sender.clone();

			let stop = stop.clone();

			let write = write.clone();
			let connection_info = connection_info.clone();

			tokio::spawn(async move {
				tokio::select! {
                    _ = stop.notified() => {
                        debug!("Stopping Logic Thread");
                    }
                    e = Self::logic_thread(read,write,connection_info) => {
                        
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

			let write = write.clone();
			let connection_info = connection_info.clone();

			tokio::spawn(async move {
				tokio::select! {
                    _ = stop.notified() => {
                        debug!("Stopping heartbeat thread");
                        
                    }
                    e = Self::heartbeat_thread(write,connection_info) => {
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

			let write = write.clone();
			let connection_info = connection_info.clone();

			tokio::spawn(async move {
				tokio::select! {
                    _ = stop.notified() => {
                        debug!("Stopping message thread");
                        
                    }
                    e = Self::message_thread(message_reciver,write,connection_info) => {
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
		connection_info: Arc<tokio::sync::Mutex<ConnectionInfo>>
	) -> std::result::Result<(), Box<dyn std::error::Error>> {
		loop {
			let message = reader.next().await.ok_or(Errors::ReadError)??;
			match message {
				tokio_tungstenite::tungstenite::Message::Text(data) => {
					println!("{:?}", data);
					let packet = serde_json::from_str::<IncomingPacket>(&data)?;
					debug!("Recived packet: {:?}", packet);

					match packet.data {
						crate::discord::voice_gateway_packets::IncomingPacketsData::Hello(payload) => {
							let mut connection_info = connection_info.lock().await;
							connection_info.heartbeat_interval = std::time::Duration::from_millis(
								payload.heartbeat_interval
							);
							connection_info.start_heartbeat();

							let packet = serde_json::to_string(
								&OutGoingPacket::new(
									OutGoingPacketsData::Identify(Identify {
										guild_id: connection_info.aditional_data.guild_id.clone(),
										user_id: connection_info.aditional_data.user_id.clone(),
										session_id: connection_info.aditional_data.session_id.clone(),
										voice_token: connection_info.aditional_data.voice_token.clone(),
									})
								)?
							)?;
							println!("{:?}", packet);
							let mut writer = writer.lock().await;
							writer.send(tokio_tungstenite::tungstenite::Message::Text(packet)).await?;

							trace!("Recived Hello packet");
							debug!("Recived Hello packet: {:?}", payload); //TODO: remove
						}
						crate::discord::voice_gateway_packets::IncomingPacketsData::Ready(payload) => {
							trace!("Recived Ready packet");
							let connection_info = connection_info.lock().await;
							connection_info.handle.emit_all(
								"voice_gateway",
								webview_packets::VoiceGateway::Ready(payload)
							)?;
						}
						crate::discord::voice_gateway_packets::IncomingPacketsData::SessionDescription() => todo!(),
						crate::discord::voice_gateway_packets::IncomingPacketsData::Speaking() => todo!(),
						crate::discord::voice_gateway_packets::IncomingPacketsData::HeartbeatAck(_) => {
							let mut connection_info = connection_info.lock().await;
							connection_info.ack_recived = true;
						}
						crate::discord::voice_gateway_packets::IncomingPacketsData::Resumed() => todo!(),
						crate::discord::voice_gateway_packets::IncomingPacketsData::ClientDisconnect() => todo!(),
						crate::discord::voice_gateway_packets::IncomingPacketsData::UserInfo(payload) => {
							println!("UserInfo {:?}", payload);
						}
						crate::discord::voice_gateway_packets::IncomingPacketsData::UserInfoPlatform(payload) => {
							println!("UserInfoPlatform {:?}", payload);
						}
						crate::discord::voice_gateway_packets::IncomingPacketsData::Unknown(data) => {
							warn!("Unknown packet");
							println!("{:?}", data);
							let connection_info = connection_info.lock().await;
							connection_info.handle.emit_all(
								"voice_gateway",
								webview_packets::VoiceGateway::Packet(data)
							)?;
						}
					}
				}
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
		connection_info: Arc<tokio::sync::Mutex<ConnectionInfo>>
	) -> std::result::Result<(), Box<dyn std::error::Error>> {
		let should_start = {
			let connection_info = connection_info.lock().await;
			connection_info.hearbeat_notify.clone()
		};
		debug!("Waiting for start heartbeat");
		should_start.notified().await;
		debug!("Starting heartbeat");

		let mut interval = {
			let connection_info = connection_info.lock().await;
			tokio::time::interval(connection_info.heartbeat_interval)
		};
		let now = SystemTime::now();
		loop {
			interval.tick().await;
			let mut connection_info = connection_info.lock().await;
			if connection_info.ack_recived {
				warn!("Heartbeat ack not recived");
			}
			connection_info.ack_recived = false;
			let packet = serde_json::to_string(
				&OutGoingPacket::new(
					OutGoingPacketsData::Heartbeat(Heartbeat {
						nonce: now.elapsed().unwrap().as_millis() as u64,
					})
				)?
			)?;
			let mut writer = writer.lock().await;
			writer.send(tokio_tungstenite::tungstenite::Message::Text(packet)).await?;
			trace!("Sent heartbeat packet");
		}
	}

	#[allow(unused)]
	async fn message_thread(
		mut message_receiver: tokio::sync::mpsc::Receiver<VoiceGatewayMessages>,
		writer: Arc<
			tokio::sync::Mutex<
				SplitSink<
					WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
					tokio_tungstenite::tungstenite::Message
				>
			>
		>,
		connection_info: Arc<tokio::sync::Mutex<ConnectionInfo>>
	) -> crate::Result<()> {
		loop {
			let res = message_receiver.recv().await;
			if res.is_none() {
				return Ok(());
			}
			let message = res.unwrap();
			match message {
				VoiceGatewayMessages::Packet(payload) => {
					let mut writer = writer.lock().await;
					writer.send(tokio_tungstenite::tungstenite::Message::Text(payload)).await?;
				}
			}
		}
	}
}
