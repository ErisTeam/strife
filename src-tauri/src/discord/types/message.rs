use serde::{ Serialize, Deserialize };

use crate::discord::user;

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
pub struct Message {
	id: String,
	channel_id: String,
	author: user::PublicUser,

	content: String,
	timestamp: String,
	edited_timestamp: Option<String>,
	tts: bool,
	mention_everyone: bool,

	//mentions: Vec<user::PublicUser>,
	mention_roles: Vec<Role>,
	mention_channels: Option<Vec<ChannelMentionObject>>,

	attachments: Vec<Attachment>,

	embeds: Vec<Embed>,
	reactions: Option<Vec<Reaction>>,
	nonce: Option<serde_json::Value>,

	pinned: bool,
	webhook_id: Option<serde_json::Value>,

	r#type: u64,
	activity: Option<MessageActivity>,
	application: Option<serde_json::Value>,
	application_id: Option<u64>,

	message_reference: Option<serde_json::Value>,

	flags: Option<u64>, //todo custom deserializer

	referenced_message: Option<Box<Message>>,

	interaction: Option<MessageInteraction>,

	thread: Option<Channel>,

	components: Option<Vec<MessageComponent>>,

	sticker_items: Option<Vec<StickerItem>>,

	stickers: Option<Vec<Sticker>>,

	position: Option<u64>,

	role_subscribtion_date: Option<RoleSubscriptionData>,
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
	user: user::PublicUser,
	member: Option<GuildMember>,
}