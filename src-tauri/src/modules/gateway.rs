use std::{ sync::Arc, net::TcpStream };

use websocket::{ OwnedMessage, sync::Client, native_tls::TlsStream };

use crate::{
	main_app_state::MainState,
	webview_packets,
	discord::gateway_packets::{ GatewayPackets, InitData, Properties, Presence, ClientState },
	modules::gateway_utils::send_heartbeat,
};

pub struct Gateway {
	pub timeout_ms: u64,
	pub heartbeat_interval: u64,
	pub state: Arc<MainState>,

	token: String,
}
impl Gateway {
	pub fn new(state: Arc<MainState>) -> Self {
		Self {
			state,
			timeout_ms: 0,
			heartbeat_interval: 0,
			token: "".to_string(),
		}
	}
	fn conn(&self) -> Client<TlsStream<TcpStream>> {
		use websocket::ClientBuilder;
		let mut headers = websocket::header::Headers::new();
		headers.set(websocket::header::Origin("https://discord.com".to_string()));
		let client = ClientBuilder::new("wss://remote-auth-gateway.discord.gg/?v=2")
			.unwrap()
			.custom_headers(&headers)
			.connect_secure(None)
			.unwrap();
		client.set_nonblocking(true).unwrap();
		client
	}
	pub async fn run(
		&mut self,
		reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,
		sender: tokio::sync::mpsc::Sender<webview_packets::Gateway>,
		token: String
	) {
		let mut reciver = reciver;
		let mut sender = sender;

		self.token = token;
		while !self.connect(&mut reciver, &mut sender).await {
			print!("Reconnecting");
		}
		println!("shutting down mobile auth")
	}

	fn init_message(&self, client: &mut Client<TlsStream<TcpStream>>, token: String) {
		let data = GatewayPackets::Identify {
			d: InitData {
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
			},
		};
		println!("{:?}", data);
		client.send_message(&OwnedMessage::Text(serde_json::to_string(&data).unwrap())).unwrap();
	}

	pub async fn connect(
		&self,
		reciver: &mut tokio::sync::mpsc::Receiver<OwnedMessage>,
		sender: &mut tokio::sync::mpsc::Sender<webview_packets::Gateway>
	) -> bool {
		println!("Connecting");

		let mut client = self.conn();

		let mut instant = std::time::Instant::now();

		let mut ack_recived = true;

		let mut started = false;

		let mut last_s: Option<u64> = None;

		//let mut user_id = None;

		self.init_message(&mut client, self.token.clone());

		loop {
			let message = client.recv_message();

			let m = reciver.try_recv();
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
					m => {
						println!("Not text {:?}", m);
					}
				}
			}
			let last_s = last_s.clone();
			send_heartbeat(
				&mut instant,
				started,
				self.heartbeat_interval,
				&mut ack_recived,
				&mut client,
				&(|| -> Option<String> {
					if last_s.is_none() {
						return Some(
							serde_json::to_string(&(GatewayPackets::HeartbeatNull {})).unwrap()
						);
					} else {
						return Some(
							serde_json
								::to_string(&(GatewayPackets::Heartbeat { d: last_s.unwrap() }))
								.unwrap()
						);
					}
				})
			);
			//tokio thread sleep
			tokio::time::sleep(std::time::Duration::from_millis(10)).await;
		}
	}
}