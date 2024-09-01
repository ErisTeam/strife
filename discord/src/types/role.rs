use serde::{Serialize, Deserialize, de::Visitor};
use crate::types::snowflake::Snowflake;
use std::ops::Deref;
use std::fmt::Display;

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize)]
pub struct Permissions(u64);

impl Permissions {
    /// (1 << 0) Allows creation of instant invites (T, V, S)
    pub const CREATE_INSTANT_INVITE: u64 = (1 << 0);
    /// (1 << 1) Allows kicking members
    pub const KICK_MEMBERS: u64 = (1 << 1);
    /// Allows banning members
    pub const BAN_MEMBERS: u64 = (1 << 2);
    /// Allows all permissions and bypasses channel permission overwrites 
    pub const ADMINISTRATOR: u64 = (1 << 3);
    /// Allows management and editing of channels (T, V, S)
    pub const MANAGE_CHANNELS: u64 = (1 << 4);
    /// Allows management and editing of the guild 
    pub const MANAGE_GUILD: u64 = (1 << 5);
    /// Allows for the addition of reactions to messages (T, V)
    pub const ADD_REACTIONS: u64 = (1 << 6);
    /// Allows for viewing of audit logs 
    pub const VIEW_AUDIT_LOG: u64 = (1 << 7);
    /// Allows for using priority speaker in a voice channel (V)
    pub const PRIORITY_SPEAKER: u64 = (1 << 8);
    /// Allows the user to go live (V)
    pub const STREAM: u64 = (1 << 9);
    /// Allows guild members to view a channel, which includes reading messages in text channels and joining voice channels (T, V, S)
    pub const VIEW_CHANNEL: u64 = (1 << 10);
    /// Allows for sending messages in a channel and creating threads in a forum (does not allow sending messages in threads) (T, V)
    pub const SEND_MESSAGES: u64 = (1 << 11);
    /// Allows for sending of /tts messages (T, V)
    pub const SEND_TTS_MESSAGES: u64 = (1 << 12);
    /// Allows for deletion of other users messages (T, V)
    pub const MANAGE_MESSAGES: u64 = (1 << 13);
    /// Links sent by users with this permission will be auto-embedded (T, V)
    pub const EMBED_LINKS: u64 = (1 << 14);
    /// Allows for uploading images and files (T, V)
    pub const ATTACH_FILES: u64 = (1 << 15);
    /// Allows for reading of message history (T, V)
    pub const READ_MESSAGE_HISTORY: u64 = (1 << 16);
    /// Allows for using the @everyone tag to notify all users in a channel, and the @here tag to notify all online users in a channel (T, V, S)
    pub const MENTION_EVERYONE: u64 = (1 << 17);
    /// Allows the usage of custom emojis from other servers (T, V)
    pub const USE_EXTERNAL_EMOJIS: u64 = (1 << 18);
    /// Allows for viewing guild insights 
    pub const VIEW_GUILD_INSIGHTS: u64 = (1 << 19);
    /// Allows for joining of a voice channel (V, S)
    pub const CONNECT: u64 = (1 << 20);
    /// Allows for speaking in a voice channel (V)
    pub const SPEAK: u64 = (1 << 21);
    /// Allows for muting members in a voice channel (V, S)
    pub const MUTE_MEMBERS: u64 = (1 << 22);
    /// Allows for deafening of members in a voice channel (V, S)
    pub const DEAFEN_MEMBERS: u64 = (1 << 23);
    /// Allows for moving of members between voice channels (V, S)
    pub const MOVE_MEMBERS: u64 = (1 << 24);
    /// Allows for using voice-activity-detection in a voice channel (V)
    pub const USE_VAD: u64 = (1 << 25);
    /// Allows for modification of own nickname 
    pub const CHANGE_NICKNAME: u64 = (1 << 26);
    /// Allows for modification of other users nicknames 
    pub const MANAGE_NICKNAMES: u64 = (1 << 27);
    /// Allows management and editing of roles (T, V, S)
    pub const MANAGE_ROLES: u64 = (1 << 28);
    /// Allows management and editing of webhooks (T, V)
    pub const MANAGE_WEBHOOKS: u64 = (1 << 29);
    /// Allows editing and deleting emojis, stickers, and soundboard sounds 
    pub const MANAGE_EXPRESSIONS: u64 = (1 << 30);
    /// Allows members to use application commands, including slash commands and context menu commands (T, V)
    pub const USE_APPLICATION_COMMANDS: u64 = (1 << 31);
    /// Allows for requesting to speak in stage channels (S)
    pub const REQUEST_TO_SPEAK: u64 = (1 << 32);
    /// Allows for editing and deleting scheduled events (V, S)
    pub const MANAGE_EVENTS: u64 = (1 << 33);
    /// Allows for deleting and archiving threads, and viewing all private threads (T)
    pub const MANAGE_THREADS: u64 = (1 << 34);
    /// Allows for creating public and announcement threads (T)
    pub const CREATE_PUBLIC_THREADS: u64 = (1 << 35);
    /// Allows for creating private threads (T)
    pub const CREATE_PRIVATE_THREADS: u64 = (1 << 36);
    /// Allows the usage of custom stickers from other servers (T, V)
    pub const USE_EXTERNAL_STICKERS: u64 = (1 << 37);
    /// Allows for sending messages in threads (T)
    pub const SEND_MESSAGES_IN_THREADS: u64 = (1 << 38);
    /// Allows for using Activities (applications with the EMBEDDED flag) in a voice channel (V)
    pub const USE_EMBEDDED_ACTIVITIES: u64 = (1 << 39);
    /// Allows for timing out users to prevent them from sending or reacting to messages in chat and threads, and from speaking in voice and stage channels 
    pub const MODERATE_MEMBERS: u64 = (1 << 40);
    /// Allows for viewing guild role subscriptions insights 
    pub const VIEW_CREATOR_MONETIZATION_ANALYTICS: u64 = (1 << 41);
    /// Allows the usage of the soundboard in a voice channel (V)
    pub const USE_SOUNDBOARD: u64 = (1 << 42);
    /// Allows for creating emojis, stickers, and soundboard sounds, and editing/deleting ones created by the current user 
    pub const CREATE_EXPRESSIONS: u64 = (1 << 43);
    /// Allows for creating scheduled events, and editing/deleting ones created by the current user 
    pub const CREATE_EVENTS: u64 = (1 << 44);
    /// Allows the usage of custom soundboard sounds from other servers (V)
    pub const USE_EXTERNAL_SOUNDS: u64 = (1 << 45);
    /// Allows for sending voice messages in a channel (T, V, S)
    pub const SEND_VOICE_MESSAGES: u64 = (1 << 46);
    /// Allows members to interact with the Clyde AI integration (T, V, S)
    pub const USE_CLYDE_AI: u64 = (1 << 47);
    /// Allows setting voice channel status (V)
    pub const SET_VOICE_CHANNEL_STATUS: u64 = (1 << 48);
    /// Allows sending polls (T, V, S)
    pub const SEND_POLLS: u64 = (1 << 49);
    /// Allows the usage of user-installed applications without forced-ephemeral responses (T, V, S)
    pub const USE_EXTERNAL_APPS: u64 = (1 << 50);
}

impl Deref for Permissions {
    type Target = u64;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl AsRef<u64> for Permissions {
    fn as_ref(&self) -> &u64 {
        self.deref()
    }
}

impl Display for Permissions {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl std::str::FromStr for Permissions {
    type Err = core::num::ParseIntError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let value = u64::from_str_radix(s, 10)?;
        Ok(Permissions(value))
    }
}

impl From<u64> for Permissions {
    fn from(value: u64) -> Self {
        Permissions(value)
    }
}

impl From<i64> for Permissions {
    fn from(value: i64) -> Self {
        Permissions(value as u64)
    }
}

impl TryFrom<&str> for Permissions {
    type Error = core::num::ParseIntError;
    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value = u64::from_str_radix(value, 10)?;
        Ok(Permissions(value))
    }
}

impl TryFrom<String> for Permissions {
    type Error = core::num::ParseIntError;
    fn try_from(value: String) -> Result<Self, Self::Error> {
        Self::try_from(value.as_str())
    }
}

struct PermissionsVisitor;

impl<'de> Visitor<'de> for PermissionsVisitor {
    type Value = Permissions;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(formatter, "a u64, i64, String or &str")
    }

    fn visit_u64<E>(self, v: u64) -> Result<Self::Value, E>
    where E: serde::de::Error {
        Ok(Permissions(v))
    }

    fn visit_i64<E>(self, v: i64) -> Result<Self::Value, E>
    where E: serde::de::Error {
        Ok(Permissions(v as u64))
    }

    fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
    where E: serde::de::Error {
        Permissions::try_from(v).map_err(|err| E::custom(err))
    }

    fn visit_string<E>(self, v: String) -> Result<Self::Value, E>
    where E: serde::de::Error {
        Permissions::try_from(v).map_err(|err| E::custom(err))
    }
}

impl<'de> Deserialize<'de> for Permissions {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where D: serde::Deserializer<'de> {
        deserializer.deserialize_any(PermissionsVisitor)
    }
}

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize)]
pub struct Flags(u64);

impl Flags {
    /// This role is part of an onboarding prompt option
    pub const IN_PROMPT: u64 = 1 << 0;
}

impl Deref for Flags {
    type Target = u64;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl AsRef<u64> for Flags {
    fn as_ref(&self) -> &u64 {
        self.deref()
    }
}

impl Display for Flags {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl std::str::FromStr for Flags {
    type Err = core::num::ParseIntError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let value = u64::from_str_radix(s, 10)?;
        Ok(Flags(value))
    }
}

impl From<u64> for Flags {
    fn from(value: u64) -> Self {
        Flags(value)
    }
}

impl From<i64> for Flags {
    fn from(value: i64) -> Self {
        Flags(value as u64)
    }
}

impl TryFrom<&str> for Flags {
    type Error = core::num::ParseIntError;
    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value = u64::from_str_radix(value, 10)?;
        Ok(Flags(value))
    }
}

impl TryFrom<String> for Flags {
    type Error = core::num::ParseIntError;
    fn try_from(value: String) -> Result<Self, Self::Error> {
        Self::try_from(value.as_str())
    }
}

struct RoleFlagsVisitor;

impl<'de> Visitor<'de> for RoleFlagsVisitor {
    type Value = Flags;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(formatter, "a u64, i64, String or &str")
    }

    fn visit_u64<E>(self, v: u64) -> Result<Self::Value, E>
    where E: serde::de::Error {
        Ok(Flags(v))
    }

    fn visit_i64<E>(self, v: i64) -> Result<Self::Value, E>
    where E: serde::de::Error {
        Ok(Flags(v as u64))
    }

    fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
    where E: serde::de::Error {
        Flags::try_from(v).map_err(|err| E::custom(err))
    }

    fn visit_string<E>(self, v: String) -> Result<Self::Value, E>
    where E: serde::de::Error {
        Flags::try_from(v).map_err(|err| E::custom(err))
    }
}

impl<'de> Deserialize<'de> for Flags {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where D: serde::Deserializer<'de> {
        deserializer.deserialize_any(RoleFlagsVisitor)
    }
}

#[derive(Debug, Default, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct Tag {
    /// The ID of the bot this role belongs to
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bot_id: Option<Snowflake>,
    /// The ID of the integration this role belongs to
    #[serde(skip_serializing_if = "Option::is_none")]
    pub integration_id: Option<Snowflake>,
    /// Whether this is the guild's premium subscriber (booster) role
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    #[serde(deserialize_with = "null_to_bool")]
    pub premium_subscriber: bool,
    /// The ID of this role's subscription SKU and listing
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subscription_listing_id: Option<Snowflake>,
    /// Whether this role is available for purchase
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    #[serde(deserialize_with = "null_to_bool")]
    pub available_for_purchase: bool,
    /// Whether this role is a guild's linked role
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    #[serde(deserialize_with = "null_to_bool")]
    pub guild_connections: bool,
}

/// Deserializes a field into a bool based on if it's present or not.
pub fn null_to_bool<'de, D>(deserializer: D) -> Result<bool, D::Error> where D: serde::Deserializer<'de> {
    Ok(match Option::<()>::deserialize(deserializer)? {
        None => false,
        Some(_) => true,
    })
}

#[derive(Debug, Default, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct Role {
    /// The ID of the role
    pub id: Snowflake,
    /// The name of the role (max 100 characters)
    pub name: String,
    /// The description for the role (max 90 characters)
    pub description: String,
    /// Integer representation of a hexadecimal color code for the role
    pub color: u64,
    /// Whether this role is pinned in the user listing
    pub hoist: bool,
    ///// The role's icon hash
    //#[serde(skip_serializing_if = "Option::is_none")]
    // TODO: pub icon: Option<String>,
    /// The role's unicode emoji
    #[serde(skip_serializing_if = "Option::is_none")]
    pub unicode_emoji: Option<String>,
    /// Position of this role
    pub position: u64,
    /// The permission bitwise value for the role
    pub permissions: String,
    /// Whether this role is managed by an integration
    pub managed: bool,
    /// Whether this role is mentionable
    pub mentionable: bool,
    /// The role's flags
    #[serde(skip_serializing_if = "Option::is_none")]
    pub flags: Option<Flags>,
    /// The tags this role has
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<Tag>>,
}

//use serde::{ Deserialize, Serialize };
//
//#[derive(Debug, Clone, Serialize, Deserialize)]
//pub struct Role {
//	pub id: String,
//	pub name: String,
//	pub color: u64,
//	pub hoist: bool,
//	pub icon: Option<String>,
//	pub unicode_emoji: Option<String>,
//	pub position: u64,
//	pub permissions: String, //TODO: custom deserializer
//	pub managed: bool,
//	pub mentionable: bool,
//	pub tags: Option<RoleTags>,
//}
//
//#[derive(Debug, Clone, Serialize, Deserialize)]
//pub struct RoleTags {
//	pub bot_id: Option<String>,
//	pub integration_id: Option<String>,
//	pub premium_subscriber: Option<serde_json::Value>,
//	pub subscription_listing_id: Option<String>,
//	pub available_for_purchase: Option<serde_json::Value>,
//	pub guild_connections: Option<serde_json::Value>,
//}
