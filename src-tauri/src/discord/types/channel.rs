use serde::{ Deserialize, Serialize };
use serde_repr::{ Deserialize_repr, Serialize_repr };

use crate::discord::user;

use super::thread::{ ThreadMember, ThreadMetadata };

pub mod partial_channels {
	use super::*;

	#[derive(Debug, Clone, Serialize, Deserialize)]
	#[serde(untagged)]
	pub enum GuildChannel {
		Voice(VoiceChannel),
		Text(TextChannel),
		Category(CategoryChannel),

		Unknown(serde_json::Value),
	}

	#[allow(dead_code)]
	impl GuildChannel {
		pub fn get_id(&self) -> &str {
			match self {
				Self::Category(c) => &c.base.id,
				Self::Text(c) => &c.base.id,
				Self::Voice(c) => &c.base.id,
				_ => panic!("unimplemented"),
			}
		}
		pub fn get_name(&self) -> &str {
			match self {
				Self::Category(c) => &c.base.name,
				Self::Text(c) => &c.base.name,
				Self::Voice(c) => &c.base.name,
				_ => panic!("unimplemented"),
			}
		}

		pub fn get_base(&self) -> &GuildChannelBase {
			match self {
				Self::Category(c) => &c.base,
				Self::Text(c) => &c.base,
				Self::Voice(c) => &c.base,
				_ => panic!("unimplemented"),
			}
		}
	}

	#[derive(Debug, Clone, Serialize, Deserialize)]
	pub struct CategoryChannel {
		#[serde(flatten)]
		pub base: GuildChannelBase,
	}

	#[derive(Debug, Clone, Serialize, Deserialize)]
	pub struct TextChannel {
		#[serde(flatten)]
		pub base: GuildChannelBase,

		pub parent_id: String,

		pub last_message_id: Option<String>,

		pub nsfw: Option<bool>,
	}

	#[derive(Debug, Clone, Serialize, Deserialize)]
	pub struct GuildChannelBase {
		pub r#type: ChannelType,
		pub id: String,
		pub name: String,

		pub position: Option<u64>,

		pub permission_overwrites: Vec<serde_json::Value>, // todo PermissionOverwrite
	}

	#[derive(Debug, Clone, Serialize, Deserialize)]
	pub struct VoiceChannel {
		#[serde(flatten)]
		pub base: GuildChannelBase,

		pub parent_id: String,

		pub bitrate: u64,

		pub user_limit: Option<u64>,

		pub rtc_region: Option<String>,
	}

	#[derive(Debug, Clone, Serialize, Deserialize)]
	pub struct PrivateChannel {
		pub r#type: ChannelType,
		pub id: String,
		pub name: Option<String>,

		pub recipient_ids: Vec<String>,
		pub is_spam: bool,
		pub last_message_id: Option<String>,
		pub flags: u64,
		pub owner_id: Option<String>,
	}
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum Channel {
	Normal(ChannelBase),
	Thread {
		#[serde(flatten)]
		channel: ChannelBase,
		member: ThreadMember,
	},
}

/// TODO split into channel and thread
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChannelBase {
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

#[derive(Debug, Clone, Serialize_repr, Deserialize_repr)]
#[repr(u8)]
pub enum ChannelType {
	GuildText = 0,
	DM = 1,
	GuildVoice = 2,
	GroupDM = 3,
	GuildCategory = 4,
	GuildAnnouncement = 5,
	AnnouncementThread = 10,
	PublicThread = 11,
	PrivateThread = 12,
	GuildStageVoice = 13,
	GuildDirectory = 14,
	GuildForum = 15,
}
