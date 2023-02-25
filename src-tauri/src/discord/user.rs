use serde::{ Serialize, Deserialize };

pub struct CurrentUser {
	verified: bool,
	username: String,
	purchased_flags: u64,
	premium_type: u64,
	premium: bool,
	phone: Option<String>,
	nsfw_allowed: bool,
	mobile: bool,
	mfa_enabled: bool,
	id: String,
	flags: u64,
	email: Option<String>,
	display_name: Option<String>,
	discriminator: String,
	desktop: bool,
	bio: Option<String>,
	banner_color: Option<String>,
	banner: Option<String>,
	avatar_decoration: Option<String>,
	avatar: Option<String>,
	accent_color: Option<u64>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicUser {
	username: String,
	public_flags: u64,
	id: String,
	display_name: Option<String>,
	discriminator: String,
	bot: Option<bool>,
	avatar_decoration: Option<String>,
	avatar: Option<String>,
}