use std::{ sync::Arc, net::TcpStream, io::Read };

use flate2::bufread::ZlibDecoder;
use tauri::{ AppHandle, Manager };
use websocket::{ OwnedMessage, sync::Client, native_tls::TlsStream };

use crate::{
	main_app_state::MainState,
	webview_packets,
	discord::gateway_packets::{
		GatewayPackets,
		Properties,
		Presence,
		ClientState,
		GatewayIncomingPacket,
		GatewayPacketsData,
	},
	modules::gateway_utils::send_heartbeat,
};

#[derive(Debug)]
pub struct Gateway {
	pub timeout_ms: u64,
	pub heartbeat_interval: u64,
	pub state: Arc<MainState>,

	resume_url: Option<String>,

	session_id: Option<String>,

	//decoder: ZlibDecoder<>

	token: String,

	pub running: bool,

	handle: AppHandle,

	reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,
}
impl Gateway {
	pub fn new(
		state: Arc<MainState>,
		handle: AppHandle,
		reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,
		token: String
	) -> Self {
		Self {
			state,
			timeout_ms: 0,
			heartbeat_interval: 0,
			running: false,
			handle,
			reciver,
			token,
			resume_url: None,
			session_id: None,
		}
	}
	fn conn(&self) -> Client<TlsStream<TcpStream>> {
		use websocket::ClientBuilder;
		let mut headers = websocket::header::Headers::new();
		headers.set(websocket::header::Origin("https://discord.com".to_string()));
		let client = ClientBuilder::new(
			"wss://gateway.discord.gg/?encoding=json&v=9&compress=zlib-stream"
		)
			.unwrap()
			.custom_headers(&headers)
			.connect_secure(None)
			.unwrap();
		client.set_nonblocking(true).unwrap();
		client
	}
	pub async fn run(&mut self) {
		self.running = true;
		while !self.connect().await {
			print!("Reconnecting");
		}
		self.running = false;
		println!("shutting down mobile auth")
	}
	fn emit_event(&self, event: webview_packets::MobileAuth) -> Result<(), tauri::Error> {
		self.handle.emit_all("gateway", event)?;
		Ok(())
	}

	fn init_message(&self, client: &mut Client<TlsStream<TcpStream>>, token: String) {
		let data = GatewayPackets::Identify {
			token,
			capabilities: 4093,
			//encoding: "JSON".to_string(),
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

	pub async fn connect(&mut self) -> bool {
		println!("Connecting");

		let mut client = self.conn();

		let mut instant = std::time::Instant::now();

		let mut ack_recived = true;

		let mut authed = false;

		let mut last_s: Option<u64> = None;

		//let mut user_id = None;

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
						return true;
					}
					OwnedMessage::Binary(bin) => {
						buffer.extend(bin.clone());

						let mut last_4 = [0u8; 4];
						last_4.copy_from_slice(&bin[bin.len() - 4..]);
						if last_4 == [0, 0, 255, 255] {
							use flate2::read::ZlibDecoder;

							let mut decoder = ZlibDecoder::new(&buffer[..]);

							let mut buf = Vec::new();

							decoder.read_to_end(&mut buf).unwrap();
							let out = String::from_utf8(buf).unwrap();
							println!("Gateway Binary {:?}", out);
							let json: GatewayIncomingPacket = serde_json
								::from_str(out.as_str())
								.unwrap();
							last_s = json.s;
							match json.d {
								GatewayPacketsData::Hello { heartbeat_interval } => {
									self.heartbeat_interval = heartbeat_interval;
									self.init_message(&mut client, self.token.clone());
									authed = true;
								}
								GatewayPacketsData::Ready { users, .. } => {
									let a = serde_json::to_string(&users).unwrap();
									println!("Ready {:?}", a);
								}
								_ => {}
							}
						}
					}
					m => {
						println!("Not text {:?}", m);
					}
				}
			}
			let last_s = last_s.clone();
			send_heartbeat(
				&mut instant,
				authed,
				self.heartbeat_interval,
				&mut ack_recived,
				&mut client,
				&(|| -> Option<String> {
					return Some(
						serde_json::to_string(&(GatewayPackets::Heartbeat { d: last_s })).unwrap()
					);
				})
			);
			//tokio thread sleep
			tokio::time::sleep(std::time::Duration::from_millis(10)).await;
		}
	}
}