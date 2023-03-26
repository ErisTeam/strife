use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CurrentUser {
    pub verified: bool,
    pub username: String,
    pub purchased_flags: u64,
    pub premium_type: u64,
    pub premium: bool,
    pub phone: Option<String>,
    pub nsfw_allowed: bool,
    pub mobile: bool,
    pub mfa_enabled: bool,
    pub id: String,
    pub flags: u64,
    pub email: Option<String>,
    pub display_name: Option<String>,
    pub discriminator: String,
    pub desktop: bool,
    pub bio: Option<String>,
    pub banner_color: Option<String>,
    pub banner: Option<String>,
    pub avatar_decoration: Option<String>,
    pub avatar: Option<String>,
    pub accent_color: Option<u64>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicUser {
    pub username: String,
    pub public_flags: u64,
    pub id: String,
    pub display_name: Option<String>,
    pub discriminator: String,
    pub bot: Option<bool>,
    pub avatar_decoration: Option<String>,
    pub avatar: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct GuildSettings {
    version: u64,
    partial: bool,
    entries: Vec<GuildSettingsEntry>,
}
#[derive(Deserialize, Debug)]
pub struct GuildSettingsEntry {
    version: u64,
    suppress_roles: bool,
    suppress_everyone: bool,
    notify_highlights: u16, //
    muted: bool,
    mute_scheduled_events: bool,
    muted_config: Option<MuteConfig>,
    mobile_push: bool,
    message_notifications: u16,
    hide_muted_channels: bool,
    guild_id: Option<String>,
    flags: u64,
    channel_overrides: Vec<ChannelOverride>,
}

#[derive(Deserialize, Debug)]
pub struct ChannelOverride {
    muted: bool,
    mute_config: Option<MuteConfig>,
    message_notifications: u16,
    collapsed: bool,
    channel_id: String,
}
#[derive(Deserialize, Debug)]
pub struct MuteConfig {
    selected_time_window: i64,
    end_time: Option<String>,
}
