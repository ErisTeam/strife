use serde::{ Deserialize, Serialize };
use serde_repr::{ Deserialize_repr, Serialize_repr };

use super::user::PublicUser;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StickerItem {
	id: String,
	name: String,
	format_type: StickerFormatType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartialSticker {
	pub r#type: StickerType,
	pub tags: Option<String>,
	pub name: String,
	pub id: String,
	pub guild_id: Option<String>,
	pub format_type: StickerFormatType,
	pub description: Option<String>,
	pub available: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sticker {
	id: String,
	pack_id: Option<String>,
	name: String,
	description: Option<String>,
	tags: Option<String>,

	r#type: StickerType,
	format_type: StickerFormatType,
	available: Option<bool>,
	guild_id: Option<String>,
	user: Option<PublicUser>,
	sort_value: Option<u64>,
}
#[derive(Debug, Clone, Serialize_repr, Deserialize_repr)]
#[repr(u8)]
pub enum StickerType {
	Standard = 1,
	Guild = 2,
}
#[derive(Debug, Clone, Serialize_repr, Deserialize_repr)]
#[repr(u8)]
pub enum StickerFormatType {
	Png = 1,
	Apng = 2,
	Lottie = 3,
	GIF = 4,
}
