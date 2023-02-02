use std::{ sync::Mutex, collections::HashMap };

use tauri::{ AppHandle, Manager };
use tokio::sync::mpsc;

use crate::manager::Messages;

#[derive(Debug, PartialEq)]
pub enum State {
	LoginScreen {
		qr_url: String,
		captcha_token: Option<String>,
	},
}

#[derive(Debug)]
pub struct MainState {
	pub tokens: Mutex<HashMap<String, String>>,
	pub state: Mutex<State>,

	sender: Mutex<mpsc::Sender<Messages>>,

	handlers: Mutex<Vec<tauri::EventHandler>>,
}
impl MainState {
	pub fn new(sender: Mutex<mpsc::Sender<Messages>>) -> Self {
		Self {
			tokens: Mutex::new(HashMap::new()),
			sender,
			state: Mutex::new(State::LoginScreen { qr_url: String::new(), captcha_token: None }),
			handlers: Mutex::new(Vec::new()),
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
		}
	}

	pub fn send(&self, msg: Messages) {
		println!("sending: {:?}", msg);

		self.sender.lock().unwrap().blocking_send(msg).unwrap();
	}
}