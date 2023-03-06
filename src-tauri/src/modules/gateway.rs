use std::{ sync::Arc, net::TcpStream, time::Instant };

use flate2::Decompress;
use tauri::{ AppHandle, Manager, api::notification::Notification };
use websocket::{ OwnedMessage, sync::Client, native_tls::TlsStream };

use crate::{
	main_app_state::{ MainState, UserData, self },
	webview_packets::{ self, GatewayEvent },
	discord::{
		gateway_packets::{ GatewayPackets, GatewayIncomingPacket, GatewayPacketsData },
		types::gateway::{ Properties, Presence, ClientState },
	},
	modules::gateway_utils::{ send_heartbeat_old, send_heartbeat },
	Flashing,
};

pub enum GatewayError {
	InvalidApiVersion,
	Other,
}

pub enum GatewayResult {
	Close,
	Reconnect,
	RecconectUsingResumeUrl,
}

#[derive(Debug)]
pub struct ConnectionInfo {
	pub authed: bool,
	pub ack_recived: bool,
	pub since_last_hearbeat: Instant,
	pub heartbeat_interval: u64,
}
impl Default for ConnectionInfo {
	fn default() -> Self {
		Self {
			authed: false,
			ack_recived: false,
			since_last_hearbeat: Instant::now(),
			heartbeat_interval: 0,
		}
	}
}
impl ConnectionInfo {
	pub fn reset(&mut self) {
		self.authed = false;
		self.ack_recived = false;
		self.since_last_hearbeat = Instant::now();
	}
	pub fn reset_since_last_hearbeat(&mut self) {
		self.since_last_hearbeat = Instant::now();
	}
}

#[derive(Debug)]
pub struct Gateway {
	pub timeout_ms: u64,
	pub heartbeat_interval: u64,
	pub state: Arc<MainState>,

	resume_url: Option<String>,

	session_id: Option<String>,

	decoder: Decompress,

	token: String,
	user_id: String,

	pub running: bool,

	handle: AppHandle,

	reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,

	connection_info: ConnectionInfo,

	use_resume_url: bool,
}
impl Gateway {
	pub fn new(
		state: Arc<MainState>,
		handle: AppHandle,
		reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,
		token: String,
		user_id: String
	) -> Self {
		Self {
			state,
			timeout_ms: 0,
			heartbeat_interval: 0,
			running: false,
			handle,
			reciver,
			token,
			user_id,
			connection_info: ConnectionInfo::default(),
			resume_url: None,
			session_id: None,
			decoder: Decompress::new(true),
			use_resume_url: false,
		}
	}

	fn handle_events(
		&mut self,
		client: &mut Client<TlsStream<TcpStream>>,
		event: GatewayIncomingPacket
	) -> Result<(), GatewayError> {
		match event.d {
			GatewayPacketsData::Hello { heartbeat_interval } => {
				self.heartbeat_interval = heartbeat_interval;
				self.init_message(client, self.token.clone());
				self.connection_info.authed = true;
			}
			GatewayPacketsData::Ready(data) => {
				println!("Ready {:?}", data);
				self.resume_url = Some(data.resume_gateway_url);
				self.session_id = Some(data.session_id);
				if self.user_id != data.user.id {
					println!("Wrong user id {} != {}", self.user_id, data.user.id);
					return Err(GatewayError::Other);
				}
				let user = UserData::new(data.user.clone(), self.token.clone(), data.guilds, data.relationships);

				let mut user_data = self.state.user_data.lock().unwrap();

				if user_data.contains_key(&self.user_id) {
					user_data.remove(&self.user_id);
				}
				user_data.insert(self.user_id.clone(), main_app_state::User::ActiveUser(user));
			}
			GatewayPacketsData::ReadySupplemental {
				merged_presences,
				merged_members,
				lazy_private_channels,
				guilds,
			} => {
				println!("ReadySupplemental {:?}", guilds);
			}
			GatewayPacketsData::MessageCreate { message, member, guild_id, mentions } => {
				println!("Message {:?}", message);
				let package;
				match event.t.clone().unwrap().as_str() {
					"MESSAGE_CREATE" => {
						package = webview_packets::Gateway::MessageCreate {
							message: message.clone(),
							mentions,
							member: member,
							guild_id: guild_id,
						};
					}
					"MESSAGE_UPDATE" => {
						package = webview_packets::Gateway::MessageUpdate {
							message: message.clone(),
							mentions,
							member: member,
							guild_id: guild_id,
						};
					}
					_ => {
						println!("Unknown message event {:?}", event.t);
						package = webview_packets::Gateway::Error {
							message: "Unknown message event".to_string(),
						};
					}
				}
				self.emit_event(package).unwrap();
				//todo repair for multi user
				if message.author.id != self.user_id {
					let notification = Notification::new(self.handle.config().tauri.bundle.identifier.clone());
					notification
						.title("New Message")
						.body(format!("{}: {}", message.author.username, message.content))
						.icon(
							format!(
								"https://cdn.discordapp.com/avatars/${}/${}.webp?size=128",
								message.author.id,
								message.author.avatar.unwrap()
							)
						)
						.show()
						.unwrap();
					let windows = self.handle.windows();
					let window = windows.iter().next().unwrap().1;
					window.set_flashing(true).unwrap();
				}
			}
			GatewayPacketsData::HeartbeatAck => {
				self.connection_info.ack_recived = true;
			}
			_ => {
				println!("Not handled {:?}", event);
			}
		}
		Ok(())
	}

	fn conn(&mut self) -> Client<TlsStream<TcpStream>> {
		use websocket::ClientBuilder;
		let mut headers = websocket::header::Headers::new();
		headers.set(websocket::header::Origin("https://discord.com".to_string()));
		let url;
		println!("{}", self.use_resume_url);
		if self.use_resume_url {
			url = self.resume_url.as_ref().unwrap().clone();
		} else {
			url = "wss://gateway.discord.gg/?encoding=json&v=9&compress=zlib-stream".to_string();
		}

		let mut client = ClientBuilder::new(url.as_str())
			.unwrap()
			.custom_headers(&headers)
			.connect_secure(None)
			.unwrap();
		client.set_nonblocking(true).unwrap();
		if self.use_resume_url {
			//client.send_message(&OwnedMessage::Text("TEST".to_string()));
		}
		self.use_resume_url = false;
		client
	}
	pub async fn run(&mut self) {
		self.running = true;
		while let Ok(result) = self.connect().await {
			print!("Reconnecting");
			if matches!(result, GatewayResult::RecconectUsingResumeUrl) {
				self.use_resume_url = true;
			}
		}
		self.running = false;
		println!("shutting down gateway")
	}
	fn emit_event(&self, event: webview_packets::Gateway) -> Result<(), tauri::Error> {
		self.handle.emit_all("gateway", GatewayEvent {
			event,
			user_id: self.user_id.clone(),
		})?;
		Ok(())
	}

	fn init_message(&self, client: &mut Client<TlsStream<TcpStream>>, token: String) {
		let data = GatewayPackets::Identify {
			token,
			capabilities: 4093,

			properties: Properties::default(),
			presence: Presence::default(),
			compress: false,
			client_state: ClientState {
				guild_versions: None,
				highest_last_message_id: "0".to_string(),
				read_state_version: 0,
				user_guild_settings_version: -1,
				user_settings_version: -1,
				private_channels_version: "0".to_string(),
				api_code_version: 0,
			},
		};
		println!("{:?}", serde_json::to_string(&data).unwrap());
		client.send_message(&OwnedMessage::Text(serde_json::to_string(&data).unwrap())).unwrap();
	}

	pub async fn connect(&mut self) -> Result<GatewayResult, GatewayError> {
		println!("Connecting");

		let mut client = self.conn();

		self.connection_info.reset();

		let mut last_s: Option<u64> = None;

		let mut buffer = Vec::<u8>::new();

		loop {
			let message = client.recv_message();

			let m = self.reciver.try_recv();
			if m.is_ok() {
				let m = m.unwrap();
				client.send_message(&m).unwrap();
			}

			if message.is_ok() {
				let message = message.unwrap();
				match message {
					OwnedMessage::Text(text) => {
						println!("Gateway Text {:?}", text);
					}

					OwnedMessage::Close(reason) => {
						println!("Close {:?}", reason);
						if let Some(reason) = reason {
							match reason.status_code {
								4004 => {
									println!("Invalid token");
									return Err(GatewayError::Other);
								}
								4013 | 4014 => {
									println!("Invalid intent");
									return Err(GatewayError::Other);
								}
								4012 => {
									println!("invalid api version");
									return Err(GatewayError::InvalidApiVersion);
								}
								4010 | 4011 => {
									println!("how? also gami is a furry");
									return Ok(GatewayResult::Reconnect);
								}
								_ => {
									return Ok(GatewayResult::RecconectUsingResumeUrl);
								}
							}
						}
						return Ok(GatewayResult::Reconnect);
					}
					OwnedMessage::Binary(bin) => {
						buffer.extend(bin.clone());

						let mut last_4 = [0u8; 4];
						last_4.copy_from_slice(&bin[bin.len() - 4..]);
						if last_4 == [0, 0, 255, 255] {
							let mut buf = Vec::with_capacity(20_971_520);
							self.decoder.decompress_vec(&buffer, &mut buf, flate2::FlushDecompress::Sync).unwrap();

							let out = String::from_utf8(buf).unwrap();
							println!("Gateway Binary gateway {:?}", out);
							let json: GatewayIncomingPacket = serde_json::from_str(out.as_str()).unwrap();
							last_s = json.s.clone();

							self.handle_events(&mut client, json);
							buffer.clear();
						}
					}
					m => {
						println!("Not text {:?}", m);
					}
				}
			}
			let last_s = last_s.clone();
			// send_heartbeat_old(
			// 	&mut self.connection_info.since_last_hearbeat,
			// 	self.connection_info.authed,
			// 	self.heartbeat_interval,
			// 	&mut self.connection_info.ack_recived,
			// 	&mut client,
			// 	&(|| -> Option<String> {
			// 		return Some(serde_json::to_string(&(GatewayPackets::Heartbeat { d: last_s })).unwrap());
			// 	})
			// );
			send_heartbeat(&mut self.connection_info, &mut client, Some(GatewayPackets::Heartbeat { d: last_s }));
			//tokio thread sleep
			tokio::time::sleep(std::time::Duration::from_millis(10)).await;
		}
	}
}