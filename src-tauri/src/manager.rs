use std::{ collections::HashMap, sync::Arc };

use log::{ debug, info, warn };
use tauri::{ AppHandle };
use tokio::sync::mpsc;
use websocket::OwnedMessage;

use crate::{ main_app_state::MainState, modules::{ gateway::Gateway, mobile_auth_gateway::MobileAuthHandler } };

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

	pub fn start_mobile_auth(&mut self, handle: AppHandle) -> Result<(), String> {
		if let Some(sender) = self.senders.get("main") {
			if sender.iter().any(|s| matches!(s, Modules::MobileAuth(_))) {
				warn!("Mobile auth already running");
				return Err("Mobile auth already running".to_string());
			}
		}

		info!("Starting mobile auth");

		let (async_proc_input_tx, async_proc_input_rx) = mpsc::channel(32);

		let mut gate = MobileAuthHandler::new(self.state.clone(), handle.clone(), async_proc_input_rx);

		self.senders.get_mut("main").unwrap().push(Modules::MobileAuth(async_proc_input_tx));
		//todo change it
		tauri::async_runtime::spawn(async move {
			gate.generate_keys();
			gate.run().await;
		});
		Ok(())
	}

	pub fn stop_mobile_auth(&mut self) {
		debug!("stop_mobile_auth");
		if let Some(sender) = self.senders.get("main") {
			if let Some(index) = sender.iter().position(|s| matches!(s, Modules::MobileAuth(_))) {
				let r = self.senders.get_mut("main").unwrap().remove(index);
				debug!("recived: {:?}", r);
				if let Modules::MobileAuth(sender) = r {
					if !sender.is_closed() {
						sender.blocking_send(OwnedMessage::Close(None)).unwrap();
					}
					info!("Mobile auth stopped")
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
			if let Some(sender) = sender.iter().find(|s| matches!(s, Modules::Gateway(_))) {
				if let Modules::Gateway(sender) = sender {
					if !sender.is_closed() {
						warn!("Gateway already running");
						return Err("Gateway already running".to_string());
					}
				}
			}
		}
		info!("Starting gateway");

		let (sender, reciver) = mpsc::channel(32);
		let mut gate = Gateway::new(self.state.clone(), handle.clone(), reciver, token.clone(), user_id.clone());

		if self.senders.get(user_id.as_str()).is_none() {
			self.senders.insert(user_id.clone(), Vec::new());
		}
		self.senders.get_mut(user_id.as_str()).unwrap().push(Modules::Gateway(sender));

		//todo change it
		tauri::async_runtime::spawn(async move {
			gate.run().await;
		});
		Ok(())
	}
	pub async fn send_to_gateway(&mut self, user_id: String, message: OwnedMessage) {
		if let Some(modules) = self.senders.get_mut(&user_id) {
			if let Some(gateway) = modules.iter().find(|a| matches!(a, Modules::Gateway(_))) {
				if let Modules::Gateway(sender) = gateway {
					if !sender.is_closed() {
						info!("send_to_gateway: {} {:?}", user_id, message);
						let r = sender.send(message).await;
						debug!("result: {} {:?}", user_id, r);
					}
				}
			}
		}
	}
}
