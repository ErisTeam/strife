use std::{ collections::HashMap, sync::{ Arc, Mutex } };

use log::debug;
use tauri::AppHandle;

use crate::{
	discord::{
		types::{ guild::PartialGuild, relationship::GatewayRelationship },
		user::{ CurrentUser, GuildSettings, GuildSettingsEntry, PublicUser },
	},
	event_manager::{ EventManager },
	manager::ThreadManager,
	modules::auth::Auth,
};

//todo move
#[derive(Debug, Clone)]
pub struct UserData {
	pub user: CurrentUser,
	token: String,

	pub users: Vec<PublicUser>,

	pub guilds: Vec<PartialGuild>,

	pub guild_settings: HashMap<String, GuildSettingsEntry>,

	pub private_channels: Vec<serde_json::Value>,

	pub relationships: Vec<GatewayRelationship>,
}
impl UserData {
	pub fn new(
		user: CurrentUser,
		token: String,

		users: Vec<PublicUser>,

		guilds: Vec<PartialGuild>,
		guild_settings: GuildSettings,

		private_channels: Vec<serde_json::Value>,

		relationships: Vec<GatewayRelationship>
	) -> Self {
		let mut map = HashMap::new();
		for entry in &guild_settings.entries {
			if let Some(id) = &entry.guild_id {
				map.insert(id.clone(), entry.clone());
			} else {
				map.insert("@me".to_string(), entry.clone());
			}
		}
		Self {
			user,
			token,
			users,
			guilds,
			guild_settings: map,
			private_channels,
			relationships,
		}
	}

	pub fn get_guild_by_channel(&self, channel_id: &str) -> Option<&PartialGuild> {
		for guild in &self.guilds {
			for channel in &guild.channels {
				if channel.get_id() == channel_id {
					return Some(guild);
				}
			}
		}
		None
	}
	pub fn get_user(&self, id: &str) -> Option<&PublicUser> {
		for user in &self.users {
			if user.id == id {
				return Some(user);
			}
		}
		None
	}
}

//todo move
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

#[derive(Debug, PartialEq)]
#[deprecated]
pub enum StateOld {
	None {},
	LoginScreen {
		qr_url: Option<String>,
		ticket: Option<String>,
		use_mfa: bool,
		captcha_rqdata: Option<String>,
		captcha_rqtoken: Option<String>,
		captcha_sitekey: Option<String>, //todo remove or not idk
	},
	MainApp {},
}
impl StateOld {
	pub fn variant_eq(a: &StateOld, b: &StateOld) -> bool {
		std::mem::discriminant(a) == std::mem::discriminant(b)
	}
	pub fn default_login_screen() -> Self {
		Self::LoginScreen {
			qr_url: None,
			ticket: None,
			use_mfa: false,
			captcha_rqdata: None,
			captcha_sitekey: None,
			captcha_rqtoken: None,
		}
	}
}

#[derive(Debug)]
#[allow(dead_code)]
pub enum State {
	None,
	LoginScreen(Auth),
	MainApp(), //todo add data
}
impl State {
	pub fn variant_eq(a: &Self, b: &Self) -> bool {
		std::mem::discriminant(a) == std::mem::discriminant(b)
	}

	pub fn login(&mut self) -> Option<&mut Auth> {
		match self {
			Self::LoginScreen(auth) => Some(auth),
			_ => None,
		}
	}
}

#[derive(Debug)]
pub struct MainState {
	pub tokens: Mutex<HashMap<String, String>>,
	pub state_old: Arc<Mutex<StateOld>>,

	pub state: Arc<Mutex<State>>,

	pub event_manager: Mutex<EventManager>,

	pub thread_manager: Mutex<Option<ThreadManager>>,

	pub last_id: Mutex<Option<String>>,

	pub users: Mutex<HashMap<String, User>>,
	//todo pub system_info: Mutex<SystemInfo>
}

impl MainState {
	pub fn new(event_manager: EventManager) -> Self {
		Self {
			tokens: Mutex::new(HashMap::new()),
			state_old: Arc::new(Mutex::new(StateOld::None {})),
			state: Arc::new(Mutex::new(State::None)),

			thread_manager: Mutex::new(None),
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
	}
	#[allow(dead_code)]
	pub fn remove_user(&self, user_id: String) {
		let mut user_data = self.users.lock().unwrap();
		user_data.remove(&user_id);
	}

	pub fn get_token(&self, user_id: String) -> Option<String> {
		let users = self.users.lock().unwrap();
		if let Some(user) = users.get(&user_id) {
			if let Some(token) = user.get_token().clone() {
				return Some(token.to_string());
			}
		}
		None
	}
	pub fn change_state(&self, new_state: State, handle: AppHandle) -> crate::Result<()> {
		let mut state = self.state.lock().unwrap();
		let event_manager = self.event_manager.lock().unwrap();

		*state = new_state;

		event_manager.clear_listeners(handle.clone());

		event_manager.register_debug(handle.clone());

		match &*state {
			State::LoginScreen(s) => {
				event_manager.register_for_login_screen(handle.clone());
			}
			State::MainApp() => {
				event_manager.register_for_main_app(handle.clone());
			}
			State::None => {
				panic!("State::None");
			}
		}

		Ok(())
	}

	pub fn change_state_old(&self, new_state: StateOld, handle: AppHandle, force: bool) {
		if !force && StateOld::variant_eq(&*self.state_old.lock().unwrap(), &new_state) {
			println!("variant eq");
			return;
		}

		let mut state = self.state_old.lock().unwrap();
		let mut thread_manager = self.thread_manager.lock().unwrap();
		let mut event_manager = self.event_manager.lock().unwrap();

		println!("{:?}", state);
		match &*state {
			StateOld::LoginScreen { .. } => {
				thread_manager.as_mut().unwrap().stop_mobile_auth();
				println!("Stoping mobile auth");
			}
			StateOld::MainApp {} => {
				if !self.last_id.lock().unwrap().is_none() {
					//todo repair for multiple users
					thread_manager.as_mut().unwrap().stop_gateway(self.last_id.lock().unwrap().clone().unwrap());
				}
			}
			StateOld::None {} => {}
		}

		*state = new_state;

		event_manager.clear_listeners(handle.clone());

		event_manager.register_debug(handle.clone());

		match &*state {
			StateOld::LoginScreen { .. } => {
				event_manager.register_for_login_screen(handle.clone());
			}
			StateOld::MainApp {} => {
				event_manager.register_for_main_app(handle.clone());
			}
			StateOld::None {} => { panic!("State::None") }
		}
	}

	pub async fn start_mobile_auth(&self, handle: AppHandle) -> Result<(), String> {
		self.thread_manager.lock().unwrap().as_mut().unwrap().start_mobile_auth(handle).await
	}
	pub fn start_gateway(&self, handle: AppHandle, user_id: String) -> Result<(), String> {
		let token = self.get_token(user_id.clone()).ok_or("No token found".to_string())?;
		self.thread_manager.lock().unwrap().as_mut().unwrap().start_gateway(handle, token.to_string(), user_id)
	}
}
