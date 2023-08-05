use serde::{ Serialize, Deserialize };

use crate::discord::{ self };

use super::{
	role::Role,
	channel::{ ChannelMentionObject, Channel },
	attachment::Attachment,
	embed::Embed,
	reaction::Reaction,
	interaction::InteractionType,
	guild::GuildMember,
	sticker::{ StickerItem, Sticker },
};

#[derive(Debug, Clone, Serialize, Deserialize)]
///
/// https://discord.com/developers/docs/resources/channel#message-object
pub struct Message {
	pub id: String,
	pub channel_id: String,
	pub author: super::user::PublicUser,

	pub content: String,
	pub timestamp: String,
	pub edited_timestamp: Option<String>,
	pub tts: bool,
	pub mention_everyone: bool,

	//mentions: Vec<user::PublicUser>,
	mention_roles: Vec<Role>,
	mention_channels: Option<Vec<ChannelMentionObject>>,

	attachments: Vec<Attachment>,

	embeds: Vec<Embed>,
	reactions: Option<Vec<Reaction>>,
	nonce: Option<serde_json::Value>,

	pinned: bool,
	webhook_id: Option<serde_json::Value>,

	r#type: u64, //TODO: enum
	activity: Option<MessageActivity>,
	application: Option<serde_json::Value>,
	application_id: Option<u64>,

	message_reference: Option<serde_json::Value>,

	flags: Option<u64>, //TODO: custom deserializer

	referenced_message: Option<Box<Message>>, //TODO: differentiate between null and not existing

	interaction: Option<MessageInteraction>,

	thread: Option<Channel>,

	components: Option<Vec<MessageComponent>>,

	sticker_items: Option<Vec<StickerItem>>,

	stickers: Option<Vec<Sticker>>,

	position: Option<u64>,

	role_subscription_data: Option<RoleSubscriptionData>,
}

#[cfg(debug_assertions)]
impl Message {
	fn debug() -> Self {
		Self {
			id: "12345".to_string(),
			channel_id: "12345".to_string(),
			author: discord::types::user::PublicUser {
				username: "?".to_string(),
				public_flags: 0,
				id: "362958640656941056".to_string(),
				global_name: None,
				discriminator: "1234".to_string(),
				bot: None,
				avatar_decoration: None,
				avatar: Some("0ad17e3c13fd7de38cbdd82e34cac15d".to_string()),
			},
			content: "Gami to Furras".to_string(),
			timestamp: "1234".to_string(),
			edited_timestamp: None,
			tts: false,
			mention_everyone: false,
			mention_roles: Vec::new(),
			mention_channels: None,
			attachments: Vec::new(),
			embeds: Vec::new(),
			reactions: None,
			nonce: None,
			pinned: false,
			webhook_id: None,
			r#type: 0,
			activity: None,
			application: None,
			application_id: None,
			message_reference: None,
			flags: None,
			referenced_message: None,
			interaction: None,
			thread: None,
			components: None,
			sticker_items: None,
			stickers: None,
			position: None,
			role_subscription_data: None,
		}
	}
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoleSubscriptionData {
	role_subscription_listing_id: String,
	tier_name: String,
	total_months_subscribed: u64,
	is_renewal: bool,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageComponent {
	ActionRow(serde_json::Value),
	Button(serde_json::Value),
	SelectMenu(serde_json::Value),
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageActivity {
	r#type: MessageActivityType,
	party_id: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[repr(u8)]
pub enum MessageActivityType {
	Join = 1,
	Spectate = 2,
	Listen = 3,
	JoinRequest = 5,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageReference {
	message_id: Option<String>,
	channel_id: Option<String>,
	guild_id: Option<String>,
	fail_if_not_exists: Option<bool>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageInteraction {
	id: String,

	r#type: InteractionType,
	name: String,
	user: super::user::PublicUser,
	member: Option<GuildMember>,
}
