use serde::{ Deserialize, Serialize };

use crate::discord::user::PublicUser;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StickerItem {
	id: String,
	name: String,
	format_type: StickerFormatType,
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
	available: bool,
	guild_id: Option<String>,
	user: Option<PublicUser>,
	sort_value: Option<u64>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[repr(u8)]
pub enum StickerType {
	Guild = 1,
	Standard = 2,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[repr(u8)]
pub enum StickerFormatType {
	Png = 1,
	Apng = 2,
	Lottie = 3,
	GIF = 4,
}