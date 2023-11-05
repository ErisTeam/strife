use std::{ sync::Arc, path::PathBuf };
use log::error;
use tauri::AppHandle;
use tokio::sync::Mutex;
use crate::{ event_manager::EventManager, modules::{ auth::Auth, main_app::MainApp, user_manager::UserManager } };

#[derive(Debug)]
#[allow(dead_code)]
pub enum State {
	None,
	Dev,
	LoginScreen(Auth),
	MainApp(MainApp),
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

	pub fn login(&self) -> Option<&Auth> {
		match self {
			Self::LoginScreen(auth) => Some(auth),
			_ => None,
		}
	}

	pub fn main_app(&self) -> Option<&MainApp> {
		match self {
			Self::MainApp(app) => Some(app),
			_ => None,
		}
	}

	pub async fn stop(&self) {
		match self {
			Self::LoginScreen(auth) => auth.stop().await,
			Self::MainApp(app) => app.stop().await,
			_ => (),
		}
	}
}

#[derive(Debug)]
pub struct MainState {
	pub state: Arc<tokio::sync::RwLock<State>>,

	pub event_manager: Mutex<EventManager>,

	pub user_manager: Arc<UserManager>,

	//TODO: pub system_info: Mutex<SystemInfo>
}

#[allow(dead_code)]
impl MainState {
	pub fn new(event_manager: EventManager) -> Self {
		Self {
			state: Arc::new(tokio::sync::RwLock::new(State::None)),

			event_manager: Mutex::new(event_manager),

			user_manager: Arc::new(UserManager::new()),
		}
	}

	pub async fn update_user_manager_dir(&self, path: PathBuf) {
		self.user_manager.update_save_dir(path).await;
	}

	pub async fn reset_state(&self) {
		let mut state = self.state.write().await;
		state.stop().await;
		*state = State::None;
	}
	pub async fn change_state(&self, new_state: State, handle: AppHandle) -> crate::Result<()> {
		let mut state = self.state.write().await;
		let mut event_manager = self.event_manager.lock().await;

		state.stop().await;

		*state = new_state;

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
