use serde::{Deserialize, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};
use super::snowflake::Snowflake;
use super::user::User;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize, Serialize)]
pub struct Sticker {
    /// The ID of the sticker
    id: Snowflake,
    /// For standard stickers, ID of the pack the sticker is from
    #[serde(skip_serializing_if = "Option::is_none")]
    pack_id: Option<Snowflake>,
    /// The name of the sticker (2-30 characters)
    name: String,
    /// The description for the sticker (max 100 characters)
    description: Option<String>,
    /// Autocomplete/suggestion tags for the sticker (1-200 characters)
    /// TODO
    /// tags 2: string,
    /// The type of sticker
    r#type: StickerType,
    /// The type of format for the sticker
    format_type: StickerFormatType,
    /// Whether this guild sticker can be used; may be false due to loss of premium subscriptions (boosts)
    #[serde(skip_serializing_if = "Option::is_none")]
    available: Option<bool>,
    /// The ID of the guild the sticker is attached to
    #[serde(skip_serializing_if = "Option::is_none")]
    guild_id: Option<Snowflake>,
    /// The user that uploaded the guild sticker
    #[serde(skip_serializing_if = "Option::is_none")]
    user: Option<User>,
    /// The standard sticker's sort order within its pack
    #[serde(skip_serializing_if = "Option::is_none")]
    sort_value: Option<u8>,
}

#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize_repr, Serialize_repr)]
pub enum StickerType {
    /// An official sticker in a current or legacy purchasable pack
    STANDARD = 1,
    /// A sticker uploaded to a guild for the guild's members
    GUILD = 2,
}

/// GIF stickers are not available through the CDN, and must be accessed at `https://media.discordapp.net/stickers/{sticker_id}.gif`.
#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize_repr, Serialize_repr)]
pub enum StickerFormatType {
    /// A PNG image
    PNG = 1,
    /// An animated PNG image, using the APNG format
    APNG = 2,
    /// A lottie animation; requires the VERIFIED and/or PARTNERED guild feature
    LOTTIE = 3,
    /// An animated GIF image
    GIF = 4,
}
