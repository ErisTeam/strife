use std::collections::HashMap;

use super::types::{
	user::{ CurrentUser, PublicUser, GuildSettingsEntry, GuildSettings },
	guild::PartialGuild,
	relationship::GatewayRelationship,
};

#[derive(Debug, Clone)]
pub struct UserData {
	pub user: CurrentUser,
	pub(crate) token: String,

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
