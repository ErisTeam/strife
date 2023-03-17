use serde::{ Deserialize, Serialize };

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Role {
	pub id: String,
	pub name: String,
	pub color: u64,
	pub hoist: bool,
	pub icon: Option<String>,
	pub unicode_emoji: Option<String>,
	pub position: u64,
	pub permissions: String, //todo custom deserializer
	pub managed: bool,
	pub mentionable: bool,
	pub tags: Option<RoleTags>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoleTags {
	pub bot_id: Option<String>,
	pub integration_id: Option<String>,
	pub premium_subscriber: Option<serde_json::Value>,
	pub subscription_listing_id: Option<String>,
	pub available_for_purchase: Option<serde_json::Value>,
	pub guild_connections: Option<serde_json::Value>,
}