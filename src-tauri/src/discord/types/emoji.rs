use serde::{ Deserialize, Serialize };

use super::user::PublicUser;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Emoji {
	pub id: Option<String>,
	pub name: Option<String>,
	pub roles: Option<Vec<String>>,
	pub user: Option<PublicUser>,
	pub require_colons: Option<bool>,
	pub managed: Option<bool>,
	pub animated: Option<bool>,
	pub available: Option<bool>,
}
