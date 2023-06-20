use std::{ sync::Mutex, collections::HashMap };
use crate::Result;

use crate::discord::user::UserData;

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub enum User {
	LoggedOut {
		discriminator: String,
		display_name: String,
		image: Option<String>,
		id: String,
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
	pub fn get_id(&self) -> Option<&str> {
		match self {
			Self::LoggedOut { id, .. } => Some(id),
			Self::ActiveUser(user) => Some(user.user.id.as_str()),
			Self::InactiveUser { .. } => None,
		}
	}
}

pub struct UserManager {
	/// A map of user IDs to their respective user data.
	pub users: Mutex<HashMap<String, User>>,
}
impl UserManager {
	pub fn new() -> Self {
		Self {
			users: Mutex::new(HashMap::new()),
		}
	}
	pub fn add_user(&self, user: User) -> Result<()> {
		let mut users = self.users.lock().unwrap();
		users.insert(user.get_id().ok_or("User is Inactive")?.to_string(), user);
		Ok(())
	}
}
