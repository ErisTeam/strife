use std::{ collections::HashMap, path::PathBuf };
use log::debug;
use serde::{ Serialize, Deserialize };
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum State {
	LoggedIn,
	LoggedOut,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
	pub state: State,
	pub token: Option<String>,
	pub global_name: Option<String>,
	pub avatar_hash: Option<String>,
}
impl Default for User {
	fn default() -> Self {
		Self {
			state: State::LoggedOut,
			token: None,
			global_name: None,
			avatar_hash: None,
		}
	}
}

#[derive(Debug, thiserror::Error)]
enum UserManagerError {
	#[error("User not found")]
	UserNotFound,
}

#[derive(Debug)]
pub struct UserManager {
	/// A map of user IDs to their respective user data.
	pub users: RwLock<HashMap<String, User>>,

	save_dir: RwLock<PathBuf>,
}
impl UserManager {
	pub fn new() -> Self {
		Self {
			save_dir: RwLock::new(PathBuf::new()),
			users: RwLock::new(HashMap::new()),
		}
	}
	pub async fn add_user(&self, user_id: String, user: User) {
		let mut users = self.users.write().await;
		users.insert(user_id, user);
	}

	#[allow(dead_code)]
	//TODO: add a way to logout
	pub async fn logout(&self, user_id: &str) -> crate::Result<()> {
		let mut users = self.users.write().await;
		let user = users.get_mut(user_id);
		if let Some(user) = user {
			user.state = State::LoggedOut;
			return Ok(());
		}
		Err(UserManagerError::UserNotFound.into())
	}
	#[allow(dead_code)]
	pub async fn remove_user(&self, user_id: &str) {
		let mut users = self.users.write().await;
		users.remove(user_id);
	}

	pub async fn get_user(&self, user_id: &str) -> Option<User> {
		let users = self.users.read().await;
		users.get(user_id).cloned()
	}

	pub async fn get_all_users(&self) -> HashMap<String, User> {
		let users = self.users.read().await;
		users.clone()
	}

	pub async fn update_save_dir(&self, new_path: PathBuf) {
		let mut path = self.save_dir.write().await;
		*path = new_path;
	}

	pub async fn save_to_file(&self) -> crate::Result<()> {
		debug!("Saving users to file");
		let users = self.users.read().await;
		let users = serde_json::to_string(&*users)?;
		let path = self.save_dir.read().await;
		let mut path = path.clone();
		path.push("users.json");

		debug!("users: {:?}", users);
		std::fs::write(path, users)?;

		Ok(())
	}

	pub async fn load_from_file(&self) -> crate::Result<()> {
		let path = self.save_dir.read().await;
		let mut path = path.clone();
		path.push("users.json");

		match std::fs::read(path) {
			Ok(data) => {
				let new_users: HashMap<String, User> = serde_json::from_slice(&data)?;
				let mut users = self.users.write().await;
				*users = new_users;
			}
			Err(e) => {
				log::warn!("Failed to load users from file: {}", e);
			}
		}
		Ok(())
	}
}
