use std::{ collections::HashMap, sync::{ Arc, Mutex } };

use log::{ debug, info, error };
use tauri::AppHandle;

use crate::{ discord::{ user::UserData }, event_manager::{ EventManager }, modules::{ auth::Auth, main_app::MainApp } };

//TODO move
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub enum User {
	LoggedOut {
		discriminator: String,
		display_name: String,
		image: Option<String>,
	},
	ActiveUser(UserData),
	InactiveUser {
		token: String,
	},
}
impl User {
	pub fn get_token(&self) -> Option<&str> {
		match self {
			Self::LoggedOut { .. } => None,
			Self::ActiveUser(UserData { token, .. }) => Some(token),
			Self::InactiveUser { token } => Some(token),
		}
	}
}

#[derive(Debug)]
#[allow(dead_code)]
pub enum State {
	None,
	Dev,
	LoginScreen(Arc<Auth>),
	MainApp(Arc<MainApp>),
}
#[allow(dead_code)]
impl State {
	pub fn variant_eq(a: &Self, b: &Self) -> bool {
		std::mem::discriminant(a) == std::mem::discriminant(b)
	}

	pub fn get_name(&self) -> &str {
		match self {
			Self::None => "None",
			Self::Dev => "Dev",
			Self::LoginScreen(_) => "LoginScreen",
			Self::MainApp(_) => "MainApp",
		}
	}

	pub fn login(&self) -> Option<&Arc<Auth>> {
		match self {
			Self::LoginScreen(auth) => Some(auth),
			_ => None,
		}
	}
	pub fn stop(&self) {
		match self {
			Self::LoginScreen(auth) => auth.stop(),
			Self::MainApp(app) => app.stop(),
			_ => (),
		}
	}
}

#[derive(Debug)]
pub struct MainState {
	pub tokens: Mutex<HashMap<String, String>>,

	pub state: Arc<Mutex<State>>,

	pub event_manager: Mutex<EventManager>,

	pub last_id: Mutex<Option<String>>,

	pub users: Mutex<HashMap<String, User>>,
	//TODO: pub system_info: Mutex<SystemInfo>
}
#[allow(dead_code)]
impl MainState {
	pub fn new(event_manager: EventManager) -> Self {
		Self {
			tokens: Mutex::new(HashMap::new()),

			state: Arc::new(Mutex::new(State::None)),

			event_manager: Mutex::new(event_manager),

			users: Mutex::new(HashMap::new()),

			last_id: Mutex::new(None),
		}
	}

	#[allow(dead_code)]
	pub fn get_users(&self) -> Vec<(String, User)> {
		let user_data = self.users.lock().unwrap();
		let mut users = Vec::new();
		for (id, user) in user_data.iter() {
			users.push((id.clone(), user.clone()));
		}
		users
	}
	pub fn get_users_ids(&self) -> Vec<String> {
		let user_data = self.users.lock().unwrap();
		let mut users = Vec::new();
		for (id, _) in user_data.iter() {
			users.push(id.clone());
		}
		users
	}

	pub fn get_user_data(&self, user_id: String) -> Option<UserData> {
		let user_data = self.users.lock().unwrap();
		if let Some(user) = user_data.get(&user_id).cloned() {
			debug!("user: {:?}", user);
			if let User::ActiveUser(user_data) = user {
				let mut u = user_data.clone();
				u.token = "Access Denied".to_string();
				return Some(u);
			}
		}
		None
	}

	/// adds a new **InactiveUser** to the user_data
	pub fn add_new_user(&self, user_id: String, token: String) {
		let mut user_data = self.users.lock().unwrap();
		user_data.insert(user_id.clone(), User::InactiveUser { token });
		let mut last_id = self.last_id.lock().unwrap();
		*last_id = Some(user_id.clone());
		info!("added new user: {}", user_id);
	}
	#[allow(dead_code)]
	pub fn remove_user(&self, user_id: String) {
		let mut user_data = self.users.lock().unwrap();
		user_data.remove(&user_id);
	}

	pub fn get_token(&self, user_id: &str) -> Option<String> {
		let users = self.users.lock().unwrap();
		if let Some(user) = users.get(user_id) {
			if let Some(token) = user.get_token().clone() {
				return Some(token.to_string());
			}
		}
		None
	}
	pub fn reset_state(&self) {
		let mut state = self.state.lock().unwrap();
		state.stop();
		*state = State::None;
	}
	pub async fn change_state(&self, new_state: State, handle: AppHandle) -> crate::Result<()> {
		let mut state = self.state.lock().unwrap();
		let event_manager = self.event_manager.lock().unwrap();

		state.stop();

		*state = new_state;

		//TODO: Start new state

		event_manager.clear_listeners(handle.clone());

		event_manager.register_debug(handle.clone());

		match &*state {
			State::LoginScreen(_) => {
				event_manager.register_for_login_screen(handle.clone());
			}
			State::MainApp(_) => {
				event_manager.register_for_main_app(handle.clone());
			}
			State::Dev => {}
			State::None => {
				error!("State::None");
				panic!("State::None");
			}
		}

		Ok(())
	}
}
