use std::{ sync::{ Mutex, Arc }, collections::HashMap };

use tauri::{ AppHandle, Manager };
use tokio::sync::mpsc;
use websocket::OwnedMessage;

use crate::{
	manager::{ ThreadManager },
	modules::mobile_auth_gateway_handler::MobileAuthHandler,
	webview_packets,
};

#[derive(Debug, PartialEq)]
pub enum State {
	LoginScreen {
		qr_url: String,
		captcha_token: Option<String>,
		ticket: Option<String>,
		use_sms: bool,
	},
	MainApp {},
}

#[derive(Debug)]
pub struct MainState {
	pub tokens: Mutex<HashMap<String, String>>,
	pub state: Mutex<State>,

	handlers: Mutex<Vec<tauri::EventHandler>>,

	pub thread_manager: Mutex<Option<ThreadManager>>,
}
impl MainState {
	pub fn new() -> Self {
		Self {
			tokens: Mutex::new(HashMap::new()),
			state: Mutex::new(State::LoginScreen {
				qr_url: String::new(),
				captcha_token: None,
				ticket: None,
				use_sms: false,
			}),
			handlers: Mutex::new(Vec::new()),
			thread_manager: Mutex::new(None),
		}
	}

	pub fn is_logged_in(&self) -> bool {
		self.tokens.lock().unwrap().len() > 0
	}

	pub fn change_state(&self, state: State, handle: AppHandle) {
		*self.state.lock().unwrap() = state;
		let state = self.state.lock().unwrap();
		let mut handlers = self.handlers.lock().unwrap();

		for handler in handlers.clone().into_iter() {
			handle.unlisten(handler);
		}
		handlers.clear();

		match &*state {
			State::LoginScreen { qr_url, .. } => {
				println!("Registering event handler for g (global");
				let h = handle.listen_global("get_qrcode", |event| {
					println!("got event-name with payload {:?}", event.payload());
				});
				handlers.push(h);
			}
			State::MainApp {} => {
				let a = self.thread_manager.lock().unwrap();
				let thread_manager = a.as_ref().unwrap();
				thread_manager.stop_mobile_auth();
			}
			_ => {}
		}
	}

	pub fn start_mobile_auth(&self, handle: AppHandle) {
		self.thread_manager.lock().unwrap().as_mut().unwrap().start_mobile_auth(handle);
	}
	pub fn start_gateway(&self, handle: AppHandle, token: String) {
		self.thread_manager.lock().unwrap().as_mut().unwrap().start_gateway(handle, token);
	}
}