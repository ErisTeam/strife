use std::{ sync::{ Arc, Mutex }, collections::HashMap };

use tauri::{ AppHandle, Manager };
use tokio::sync::mpsc;
use websocket::OwnedMessage;

use crate::{
	main_app_state::MainState,
	modules::{ mobile_auth_gateway_handler::MobileAuthHandler, gateway::Gateway },
	webview_packets,
};

/// # Information
/// TODO
#[derive(Debug)]
pub enum Modules {
	MobileAuth,
	Gateway,
}

/// # Information
/// TODO
#[derive(Debug)]
pub struct ThreadManager {
	state: Arc<MainState>,

	mobile_auth_sender: Option<Mutex<mpsc::Sender<OwnedMessage>>>,

	gateway_sender: Option<Mutex<mpsc::Sender<OwnedMessage>>>,

	senders: HashMap<Modules, mpsc::Sender<OwnedMessage>>,
}

impl ThreadManager {
	pub fn new(state: Arc<MainState>) -> Self {
		Self {
			state,
			mobile_auth_sender: None,
			senders: HashMap::new(),
			gateway_sender: None,
		}
	}
	pub fn start_mobile_auth(&mut self, handle: AppHandle) -> Result<(), String> {
		if self.mobile_auth_sender.is_some() {
			println!("Mobile auth already running");
			return Err("Mobile auth already running".to_string());
		}
		println!("Starting mobile auth");
		let mut gate = MobileAuthHandler::new(self.state.clone());
		let (async_proc_input_tx, async_proc_input_rx) = mpsc::channel(32);
		let (async_proc_output_tx, mut async_proc_output_rx) =
			mpsc::channel::<webview_packets::MobileAuth>(32);

		// TODO: Make this a function
		tauri::async_runtime::spawn(async move {
			loop {
				if let Some(output) = async_proc_output_rx.recv().await {
					println!("mobile auth event listener recived: {:?}", output);
					handle.emit_all("mobileAuth", output).unwrap();
				} else {
					println!("mobile auth event listener closing");
					break;
				}
			}
		});
		self.mobile_auth_sender = Some(Mutex::new(async_proc_input_tx));
		tauri::async_runtime::spawn(async move {
			gate.generate_keys();
			gate.run(async_proc_input_rx, async_proc_output_tx).await;
		});
		Ok(())
	}

	pub fn stop_mobile_auth(&mut self) {
		if let Some(sender) = self.mobile_auth_sender.take() {
			let sender = sender.lock().unwrap();
			sender.blocking_send(OwnedMessage::Close(None)).unwrap();
		}
	}
	pub fn start_gateway(&mut self, handle: AppHandle, token: String) -> Result<(), String> {
		if self.gateway_sender.is_some() {
			println!("Gateway already running");
			return Err("Gateway already running".to_string());
		}
		println!("Starting gateway");
		let mut gate = Gateway::new(self.state.clone());
		let (async_proc_input_tx, async_proc_input_rx) = mpsc::channel(32);
		let (async_proc_output_tx, mut async_proc_output_rx) =
			mpsc::channel::<webview_packets::Gateway>(32);

		// TODO: Make this a function
		tauri::async_runtime::spawn(async move {
			loop {
				if let Some(output) = async_proc_output_rx.recv().await {
					println!("gateway event listener recived: {:?}", output);
					handle.emit_all("gateway", output).unwrap();
				} else {
					println!("gateway event listener closing");
					break;
				}
			}
		});
		self.gateway_sender = Some(Mutex::new(async_proc_input_tx));

		let token = token.clone();
		tauri::async_runtime::spawn(async move {
			gate.run(async_proc_input_rx, async_proc_output_tx, token).await;
		});
		Ok(())
	}
}