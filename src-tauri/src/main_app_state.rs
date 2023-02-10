use std::{ sync::{ Mutex }, collections::HashMap };

use tauri::{ AppHandle };

use crate::{ manager::{ ThreadManager }, event_manager::EventManager };

#[derive(Debug, PartialEq)]
pub enum State {
	LoginScreen {
		qr_url: String, //todo change to Option<String>
		captcha_token: Option<String>,
		ticket: Option<String>,
		use_mfa: bool,
	},
	MainApp {},
}

#[derive(Debug)]
pub struct MainState {
	pub tokens: Mutex<HashMap<String, String>>,
	pub state: Mutex<State>,

	pub event_manager: Mutex<Option<EventManager>>,

	pub thread_manager: Mutex<Option<ThreadManager>>,

	//todo pub system_info: Mutex<SystemInfo>
}
impl MainState {
	pub fn new() -> Self {
		Self {
			tokens: Mutex::new(HashMap::new()),
			state: Mutex::new(State::LoginScreen {
				qr_url: String::new(),
				captcha_token: None,
				ticket: None,
				use_mfa: false,
			}),

			thread_manager: Mutex::new(None),
			event_manager: Mutex::new(None),
		}
	}

	pub fn add_token(&self, token: String, id: String) {
		self.tokens.lock().unwrap().insert(id, token);
	}

	pub fn is_logged_in(&self) -> bool {
		self.tokens.lock().unwrap().len() > 0
	}

	pub fn change_state(&self, new_state: State, handle: AppHandle) {
		*self.state.lock().unwrap() = new_state;
		let state = self.state.lock().unwrap();

		match &*state {
			State::LoginScreen { qr_url, .. } => {
				println!("Registering event handler for g (global");

				self.event_manager
					.lock()
					.unwrap()
					.as_mut()
					.unwrap()
					.register_for_login_screen(handle.clone());
				self.start_mobile_auth(handle.clone());
			}
			State::MainApp {} => {
				let a = self.thread_manager.lock().unwrap();
				let thread_manager = a.as_ref().unwrap();
				thread_manager.stop_mobile_auth();

				self.event_manager
					.lock()
					.unwrap()
					.as_mut()
					.unwrap()
					.register_for_main_app(handle.clone());
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