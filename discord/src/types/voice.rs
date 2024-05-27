use serde::{ Deserialize, Serialize };

use super::guild::GuildMember;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceState {
	guild_id: Option<String>,
	channel_id: Option<String>,
	user_id: String,
	member: Option<GuildMember>,
	session_id: String,
	deaf: bool,
	mute: bool,

	self_deaf: bool,
	self_mute: bool,
	self_stream: Option<bool>,
	self_video: bool,

	suppress: bool,

	request_to_speak_timestamp: Option<String>,
}