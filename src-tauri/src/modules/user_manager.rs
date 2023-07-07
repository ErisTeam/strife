use std::{ collections::HashMap };
use serde::Serialize;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize)]
pub enum State {
	LoggedIn,
	LoggedOut,
}
#[derive(Debug, Clone, Serialize)]
pub struct User {
	pub state: State,
	pub token: Option<String>,
	pub display_name: Option<String>,
	pub avatar: Option<String>,
}
impl Default for User {
	fn default() -> Self {
		Self {
			state: State::LoggedOut,
			token: None,
			display_name: None,
			avatar: None,
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
}
impl UserManager {
	pub fn new() -> Self {
		Self {
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
}
