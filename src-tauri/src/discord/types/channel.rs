use serde::{ Deserialize, Serialize };

use crate::discord::user;

use super::thread::{ ThreadMetadata, ThreadMember };

/// TODO split into channel and thread
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Channel {
	pub id: String,

	pub r#type: ChannelType,
	pub guild_id: Option<String>,
	pub position: Option<u64>,
	pub permission_overwrites: Option<Vec<serde_json::Value>>, // todo PermissionOverwrite
	pub name: Option<String>,
	pub topic: Option<String>,
	pub nsfw: Option<bool>,
	pub last_message_id: Option<String>,
	pub bitrate: Option<u64>,
	pub user_limit: Option<u64>,
	pub rate_limit_per_user: Option<u64>,
	pub recipients: Option<Vec<user::PublicUser>>,
	pub icon: Option<String>,
	pub owner_id: Option<String>,
	pub application_id: Option<String>,
	pub managed: Option<bool>,
	pub parent_id: Option<String>,
	pub last_pin_timestamp: Option<String>,
	pub rtc_region: Option<String>,
	pub video_quality_mode: Option<u64>,
	pub message_count: Option<u64>,
	pub member_count: Option<u64>,
	pub thread_metadata: Option<ThreadMetadata>,
	pub member: Option<ThreadMember>,
	pub default_auto_archive_duration: Option<u64>,
	pub permissions: Option<String>,
	pub flags: Option<u64>, // todo custom deserializer
	pub total_message_sent: Option<u64>,
	pub avaible_tags: Option<Vec<serde_json::Value>>, // todo ChannelTag
	pub applied_tags: Option<Vec<serde_json::Value>>, // todo ChannelTag
	pub default_reaction_emoji: Option<Vec<serde_json::Value>>, // todo Emoji
	pub default_thread_rate_limit_per_user: Option<u64>,
	pub default_sort_order: Option<u64>,
	pub default_forum_layout: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChannelMentionObject {
	pub id: String,
	pub guild_id: String,

	pub r#type: ChannelType,
	pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[repr(u8)]
pub enum ChannelType {
	GuildText,
	DM,
	GuildVoice,
	GroupDM,
	GuildCategory,
	GuildAnnouncement,
	AnnouncementThread,
	PublicThread,
	PrivateThread,
	GuildStageVoice,
	GuildDirectory,
	GuildForum,
}