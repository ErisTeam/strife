use serde::{Deserialize, Deserializer, Serialize};

fn deserialize_flags<'de, D>(deserializer: D) -> Result<UserFlags, D::Error>
where
    D: Deserializer<'de>,
{
    let flags: u64 = Deserialize::deserialize(deserializer)?;

    Ok(UserFlags { flags })
}

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

    pub flags: UserFlags,

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
    selected_time_window: Option<i64>, //todo custom deserializer -1 = none
    end_time: Option<String>,
}
#[derive(Debug, Clone, Serialize)]
pub struct UserFlags {
    pub flags: u64,
}

impl<'de> Deserialize<'de> for UserFlags {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let flags: u64 = Deserialize::deserialize(deserializer)?;

        Ok(UserFlags { flags })
    }
}

impl PublicUserFlags for UserFlags {
    fn staff(&self) -> bool {
        self.flags & 1 << 0 != 0
    }
    fn partner(&self) -> bool {
        self.flags & 1 << 1 != 0
    }
    fn hype_squad_events(&self) -> bool {
        self.flags & 1 << 2 != 0
    }
    fn bug_hunter_level_1(&self) -> bool {
        self.flags & 1 << 3 != 0
    }
    fn bug_hunter_level_2(&self) -> bool {
        self.flags & 1 << 14 != 0
    }
    fn house_bravery(&self) -> bool {
        self.flags & 1 << 6 != 0
    }
    fn house_brilliance(&self) -> bool {
        self.flags & 1 << 7 != 0
    }
    fn house_balance(&self) -> bool {
        self.flags & 1 << 8 != 0
    }
    fn early_supporter(&self) -> bool {
        self.flags & 1 << 9 != 0
    }
    fn team_user(&self) -> bool {
        self.flags & 1 << 10 != 0
    }
    fn system(&self) -> bool {
        self.flags & 1 << 12 != 0
    }
    fn verified_bot(&self) -> bool {
        self.flags & 1 << 16 != 0
    }

    fn verified_bot_developer(&self) -> bool {
        self.flags & 1 << 17 != 0
    }
    fn active_developer(&self) -> bool {
        self.flags & 1 << 22 != 0
    }
    fn certified_moderator(&self) -> bool {
        self.flags & 1 << 18 != 0
    }
}
impl PrivateUserFlags for UserFlags {
    fn mfa_sms(&self) -> bool {
        self.flags & 1 << 4 != 0
    }
    fn verified_email(&self) -> bool {
        self.flags & 1 << 43 != 0
    }
    fn premium_promo_dismissed(&self) -> bool {
        self.flags & 1 << 5 != 0
    }

    fn has_unread_urgent_messages(&self) -> bool {
        self.flags & 1 << 13 != 0
    }
}
impl OtherUserFlags for UserFlags {
    fn bot_http_interactions(&self) -> bool {
        self.flags & 1 << 19 != 0
    }
    fn internal_application(&self) -> bool {
        self.flags & 1 << 11 != 0
    }

    fn premium_discriminator(&self) -> bool {
        self.flags & 1 << 37 != 0
    }
    fn spammer(&self) -> bool {
        self.flags & 1 << 20 != 0
    }
    fn disabled_premium(&self) -> bool {
        self.flags & 1 << 21 != 0
    }

    fn hight_global_rate_limit(&self) -> bool {
        self.flags & 1 << 33 != 0
    }

    fn deleted(&self) -> bool {
        self.flags & 1 << 34 != 0
    }

    fn disabled_suspicious_activity(&self) -> bool {
        self.flags & 1 << 35 != 0
    }

    fn disabled_self_deleted(&self) -> bool {
        self.flags & 1 << 36 != 0
    }

    fn used_desktop(&self) -> bool {
        self.flags & 1 << 38 != 0
    }

    fn used_mobile(&self) -> bool {
        self.flags & 1 << 40 != 0
    }

    fn used_web(&self) -> bool {
        self.flags & 1 << 39 != 0
    }

    fn disabled(&self) -> bool {
        self.flags & 1 << 41 != 0
    }

    fn quarantined(&self) -> bool {
        self.flags & 1 << 44 != 0
    }

    fn collaborator(&self) -> bool {
        self.flags & 1 << 50 != 0
    }
    fn restricted_collaborator(&self) -> bool {
        self.flags & 1 << 51 != 0
    }
}
pub trait PublicUserFlags {
    fn staff(&self) -> bool;
    fn partner(&self) -> bool;
    fn hype_squad_events(&self) -> bool;
    fn bug_hunter_level_1(&self) -> bool;
    fn bug_hunter_level_2(&self) -> bool;

    fn house_bravery(&self) -> bool;
    fn house_brilliance(&self) -> bool;
    fn house_balance(&self) -> bool;

    fn early_supporter(&self) -> bool;
    fn team_user(&self) -> bool;
    fn system(&self) -> bool;

    fn verified_bot(&self) -> bool;
    fn verified_bot_developer(&self) -> bool;
    fn active_developer(&self) -> bool;
    fn certified_moderator(&self) -> bool;
}
pub trait OtherUserFlags {
    fn bot_http_interactions(&self) -> bool;
    fn internal_application(&self) -> bool;

    fn premium_discriminator(&self) -> bool;
    fn spammer(&self) -> bool;
    fn disabled_premium(&self) -> bool;
    fn hight_global_rate_limit(&self) -> bool;
    fn deleted(&self) -> bool;
    fn disabled_suspicious_activity(&self) -> bool;
    fn disabled_self_deleted(&self) -> bool;
    fn used_desktop(&self) -> bool;
    fn used_mobile(&self) -> bool;
    fn used_web(&self) -> bool;
    fn disabled(&self) -> bool;
    fn quarantined(&self) -> bool;
    fn collaborator(&self) -> bool;
    fn restricted_collaborator(&self) -> bool;
}

pub trait PrivateUserFlags {
    fn mfa_sms(&self) -> bool;
    fn verified_email(&self) -> bool;
    fn premium_promo_dismissed(&self) -> bool;
    fn has_unread_urgent_messages(&self) -> bool;
}
