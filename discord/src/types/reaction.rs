use serde::{ Serialize, Deserialize };

use super::emoji::Emoji;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Reaction {
	pub count: u64,
	pub me: bool,
	pub emoji: Emoji,
}