use std::{ sync::{ Arc }, collections::HashMap };

use serde::Serialize;
use tauri::{ AppHandle, Manager };
use tokio::sync::mpsc;
use websocket::OwnedMessage;

use crate::{ main_app_state::MainState, modules::{ mobile_auth_gateway_handler::MobileAuthHandler, gateway::Gateway } };

/// # Information
/// TODO
#[derive(Debug)]
pub enum Modules {
	MobileAuth(mpsc::Sender<OwnedMessage>),
	Gateway(mpsc::Sender<OwnedMessage>),
}

/// # Information
/// TODO
#[derive(Debug)]
pub struct ThreadManager {
	state: Arc<MainState>,

	senders: HashMap<String, Vec<Modules>>,
}

impl ThreadManager {
	pub fn new(state: Arc<MainState>) -> Self {
		let mut s = Self {
			state,

			senders: HashMap::new(),
		};
		s.senders.insert("main".to_string(), Vec::new());
		s
	}

	async fn event_listener<T: Clone + std::fmt::Debug + Serialize>(
		event: &str,
		async_proc_output_rx: mpsc::Receiver<T>,
		handle: AppHandle
	) {
		let mut async_proc_output_rx = async_proc_output_rx;
		println!("mobile auth event listener started");
		loop {
			if let Some(output) = async_proc_output_rx.recv().await {
				println!("mobile auth event listener recived: {:?}", output);
				handle.emit_all(event, output).unwrap();
			} else {
				println!("mobile auth event listener closing");
				break;
			}
		}
	}

	pub fn start_mobile_auth(&mut self, handle: AppHandle) -> Result<(), String> {
		if let Some(sender) = self.senders.get("main") {
			if sender.iter().any(|s| matches!(s, Modules::MobileAuth(_))) {
				println!("Mobile auth already running");
				return Err("Mobile auth already running".to_string());
			}
		}

		println!("Starting mobile auth");

		let (async_proc_input_tx, async_proc_input_rx) = mpsc::channel(32);

		let mut gate = MobileAuthHandler::new(self.state.clone(), handle.clone(), async_proc_input_rx);

		self.senders.get_mut("main").unwrap().push(Modules::MobileAuth(async_proc_input_tx));
		tauri::async_runtime::spawn(async move {
			gate.generate_keys();
			gate.run().await;
		});
		Ok(())
	}

	pub fn stop_mobile_auth(&mut self) {
		println!("stop_mobile_auth");
		if let Some(sender) = self.senders.get("main") {
			println!("s");
			if let Some(index) = sender.iter().position(|s| matches!(s, Modules::MobileAuth(_))) {
				let r = self.senders.get_mut("main").unwrap().remove(index);
				println!("{:?}", r);
				if let Modules::MobileAuth(sender) = r {
					if !sender.is_closed() {
						sender.blocking_send(OwnedMessage::Close(None)).unwrap();
					}
					println!("Mobile auth stopped")
				}
			}
		}
	}
	pub fn stop_gateway(&mut self, user_id: String) {
		if let Some(sender) = self.senders.get(user_id.as_str()) {
			if let Some(index) = sender.iter().position(|s| matches!(s, Modules::Gateway(_))) {
				let r = self.senders.get_mut(user_id.as_str()).unwrap().remove(index);
				if let Modules::Gateway(sender) = r {
					if !sender.is_closed() {
						sender.blocking_send(OwnedMessage::Close(None)).unwrap();
					}
				}
			}
		}
	}
	pub fn start_gateway(&mut self, handle: AppHandle, token: String, user_id: String) -> Result<(), String> {
		if let Some(sender) = self.senders.get(user_id.as_str()) {
			if sender.iter().any(|s| matches!(s, Modules::Gateway(_))) {
				println!("Gateway already running");
				return Err("Gateway already running".to_string());
			}
		}
		println!("Starting gateway");

		let (sender, reciver) = mpsc::channel(32);
		let mut gate = Gateway::new(self.state.clone(), handle.clone(), reciver, token.clone(), user_id.clone());

		if self.senders.get(user_id.as_str()).is_none() {
			self.senders.insert(user_id.clone(), Vec::new());
		}
		self.senders.get_mut(user_id.as_str()).unwrap().push(Modules::Gateway(sender));

		tauri::async_runtime::spawn(async move {
			gate.run().await;
		});
		Ok(())
	}
}