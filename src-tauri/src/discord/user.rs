use serde::{ Serialize, Deserialize };

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CurrentUser {
	pub verified: bool,
	pub username: String,
	pub purchased_flags: u64,
	pub premium_type: u64,
	pub premium: bool,
	pub phone: Option<String>,
	pub nsfw_allowed: bool,
	pub mobile: bool,
	pub mfa_enabled: bool,
	pub id: String,
	pub flags: u64,
	pub email: Option<String>,
	pub display_name: Option<String>,
	pub discriminator: String,
	pub desktop: bool,
	pub bio: Option<String>,
	pub banner_color: Option<String>,
	pub banner: Option<String>,
	pub avatar_decoration: Option<String>,
	pub avatar: Option<String>,
	pub accent_color: Option<u64>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicUser {
	pub username: String,
	pub public_flags: u64,
	pub id: String,
	pub display_name: Option<String>,
	pub discriminator: String,
	pub bot: Option<bool>,
	pub avatar_decoration: Option<String>,
	pub avatar: Option<String>,
}