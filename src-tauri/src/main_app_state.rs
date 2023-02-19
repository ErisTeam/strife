use std::{ sync::{ Mutex, Arc }, collections::HashMap };

use tauri::{ AppHandle };

use crate::{ manager::{ ThreadManager }, event_manager::EventManager };

#[derive(Debug, PartialEq)]
pub enum State {
	LoginScreen {
		qr_url: Option<String>,
		captcha_token: Option<String>,
		ticket: Option<String>,
		use_mfa: bool,
	},
	MainApp {},
}
impl State {
	pub fn variant_eq(a: &State, b: &State) -> bool {
		std::mem::discriminant(a) == std::mem::discriminant(b)
	}
	pub fn default_login_screen() -> Self {
		Self::LoginScreen {
			qr_url: None,
			captcha_token: None,
			ticket: None,
			use_mfa: false,
		}
	}
}

#[derive(Debug)]
pub struct MainState {
	pub tokens: Mutex<HashMap<String, String>>,
	pub state: Arc<Mutex<State>>,

	pub event_manager: Mutex<Option<EventManager>>,

	pub thread_manager: Mutex<Option<ThreadManager>>,

	pub last_id: Mutex<Option<String>>,

	//todo pub system_info: Mutex<SystemInfo>
}

impl MainState {
	pub fn new() -> Self {
		Self {
			tokens: Mutex::new(HashMap::new()),
			state: Arc::new(
				Mutex::new(State::LoginScreen {
					qr_url: None,
					captcha_token: None,
					ticket: None,
					use_mfa: false,
				})
			),

			thread_manager: Mutex::new(None),
			event_manager: Mutex::new(None),

			last_id: Mutex::new(None),
		}
	}

	pub fn add_token(&self, token: String, id: String) {
		self.tokens.lock().unwrap().insert(id.clone(), token);
		self.last_id.lock().unwrap().replace(id);
	}

	pub fn remove_token(&self, id: String) {
		self.tokens.lock().unwrap().remove(&id);
	}

	pub fn is_logged_in(&self) -> bool {
		self.tokens.lock().unwrap().len() > 0
	}

	pub fn change_state(&self, new_state: State, handle: AppHandle, force: bool) {
		if !force && !State::variant_eq(&*self.state.lock().unwrap(), &new_state) {
			return;
		}
		println!("bbbbbbbbbbbbbbbbbbbbb");
		let mut state = self.state.lock().unwrap();
		let mut thread_manager = self.thread_manager.lock().unwrap();
		let mut event_manager = self.event_manager.lock().unwrap();
		match &*state {
			State::LoginScreen { .. } => {
				thread_manager.as_mut().unwrap().stop_mobile_auth();
			}
			State::MainApp {} => {
				thread_manager
					.as_mut()
					.unwrap()
					.stop_gateway(self.last_id.lock().unwrap().clone().unwrap());
			}
		}
		println!("ccccccccccccccccc");

		*state = new_state;

		println!("cccccccccccccdddddddddddddddd");
		event_manager.as_mut().unwrap().clear_listeners(handle.clone());

		println!("dddddddddddddddddddd");

		match &*state {
			State::LoginScreen { .. } => {
				println!("nnnnnnnnnn");
				event_manager.as_mut().unwrap().register_for_login_screen(handle.clone());

				thread_manager.as_mut().unwrap().start_mobile_auth(handle.clone());
				println!("bbbbbbbbbbbbbbbb");
				//self.start_mobile_auth(handle.clone());
			}
			State::MainApp {} => {
				event_manager.as_mut().unwrap().register_for_main_app(handle.clone());
			}
		}
	}

	pub fn start_mobile_auth(&self, handle: AppHandle) {
		self.thread_manager.lock().unwrap().as_mut().unwrap().start_mobile_auth(handle);
	}
	pub fn start_gateway(&self, handle: AppHandle, user_id: String) {
		let token = self.tokens.lock().unwrap().get(&user_id).unwrap().clone();
		self.thread_manager.lock().unwrap().as_mut().unwrap().start_gateway(handle, token, user_id);
	}
}