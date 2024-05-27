use serde::{ Deserialize, Serialize };
use serde_repr::{ Deserialize_repr, Serialize_repr };
use super::{
    Snowflake,
    guild::Integration,
};

// Discord User types based on the official documentation (https://discord.com/developers/docs/resources/user)

/// https://discord.com/developers/docs/resources/user#user-object-user-flags
// TODO: I don't like the use of u32 here... It's wastefull, maybe it would be possible to just
// save the number of the shift as the representation but when converting from this enum to a
// number in json and rust it would shift the 1 by the repr and return that instead
#[repr(u32)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Serialize_repr)]
pub enum UserFlag {
    Staff = 1 << 0, // Discord Employee
    Partner = 1 << 1, // Partnered Server Owner
    Hypesquad = 1 << 2, // HypeSquad Events Member
    BugHunterLevel1 = 1 << 3, // Bug Hunter Level 1
    HypesquadOnlineHouse1 = 1 << 6, // House Bravery Member
    HypesquadOnlineHouse2 = 1 << 7, // House Brilliance Member
    HypesquadOnlineHouse3 = 1 << 8, // House Balance Member
    PremiumEarlySupporter = 1 << 9, // Early Nitro Supporter
    TeamPseudoUser = 1 << 10, // User is a team
    BugHunterLevel2 = 1 << 14, // Bug Hunter Level 2
    VerifiedBot = 1 << 16, // Verified Bot
    VerifiedDeveloper = 1 << 17, // Early Verified Bot Developer
    CertifiedModerator = 1 << 18, // Moderator Programs Alumni
    BotHttpInteractions = 1 << 19, // Bot uses only HTTP interactions and is shown in the online member list
    ActiveDeveloper = 1 << 22, // User is an Active Developer
}

/// https://discord.com/developers/docs/resources/user#user-object-premium-types
#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Serialize_repr)]
pub enum PremiumTypes {
    None = 0,
    NitroClassic = 1,
    Nitro = 2,
    NitroBasic = 3,
}

/// https://discord.com/developers/docs/resources/user#connection-object-services
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Services {
    BattleNet,
    Bungie,
    Domain,
    EBay,
    EpicGames,
    Facebook,
    GitHub,
    Instagram,
    LeagueOfLegends,
    PayPal,
    Playstation,
    Reddit,
    RiotGames,
    Spotify,
    /// Service can no longer be added by users
    Skype,
    Steam,
    TikTok,
    Twitch,
    Twitter,
    Xbox,
    YouTube,
}

/// https://discord.com/developers/docs/resources/user#connection-object-visibility-types
#[repr(u8)]
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize_repr, Serialize_repr)]
pub enum Visibility {
    None = 0, // invisible to everyone except the user themselves
    Everyone = 1, // visible to everyone
}


/// https://discord.com/developers/docs/resources/user#user-object-user-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct User {
    pub id: Snowflake, // the user's id identify
    pub username: String, // the user's username, not unique across the platform identify
    pub discriminator: String, // the user's Discord-tag identify
    pub global_name: Option<String>, // the user's display name, if it is set. For bots, this is the application name identify
    pub avatar: Option<String>, // the user's avatar hash identify
    pub bot: Option<bool>, // whether the user belongs to an OAuth2 application identify
    pub system: Option<bool>, // whether the user is an Official Discord System user (part of the urgent message system) identify
    pub mfa_enabled: Option<bool>, // whether the user has two factor enabled on their account identify
    pub banner: Option<String>, // the user's banner hash identify
    pub accent_color: Option<u64>, // the user's banner color encoded as an integer representation of hexadecimal color code identify
    pub locale: Option<String>, // the user's chosen language option identify
    pub verified: Option<bool>, // whether the email on this account has been verified email
    pub email: Option<String>, // the user's email email
    // TODO: pub flags: Option<integer>, // the flags on a user's account identify
    // TODO: pub premium_type?: integer, // the type of Nitro subscription on a user's account identify
    // TODO: pub public_flags?: integer, // the public flags on a user's account identify
    // TODO: pub avatar_decoration_data?: ?avatar decoration data object, // data for the user's avatar decoration identify
}

/// https://discord.com/developers/docs/resources/user#avatar-decoration-data-object-avatar-decoration-data-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct AvatarDecoration {
    pub asset: String, // the avatar decoration hash
    pub sku_id: Snowflake, // id of the avatar decoration's SKU
}

/// https://discord.com/developers/docs/resources/user#connection-object-connection-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct Connection {
    pub id: String, // id of the connection account
    pub name: String, // the username of the connection account
    pub r#type: String, // the service of this connection
    pub revoked: Option<bool>, // whether the connection is revoked
    pub integrations: Option<Vec<Integration>>, // an array of partial server integrations
    pub verified: bool, // whether the connection is verified
    pub friend_sync: bool, // whether friend sync is enabled for this connection
    pub show_activity: bool, // whether activities related to this connection will be shown in presence updates
    pub two_way_link: bool, // whether this connection has a corresponding third party OAuth2 token
    // TODO: pub visibility: integer, // visibility of this connection
}

/// https://discord.com/developers/docs/resources/user#application-role-connection-object-application-role-connection-structure
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
pub struct ApplicationRoleConnection {
    pub platform_name: Option<String>, // the vanity name of the platform a bot has connected (max 50 characters)
    pub platform_username: Option<String>, // the username on the platform a bot has connected (max 100 characters)
    // TODO: pub metadata: object, // object mapping application role connection metadata keys to their string-ified value (max 100 characters) for the user on the platform a bot has connected
}

pub mod http {
    use super::*;

    /// https://discord.com/developers/docs/resources/user#modify-current-user-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct ModifyCurrentUser {
        pub username: Option<String>, // user's username, if changed may cause the user's discriminator to be randomized.
        // TODO: pub avatar: ?image, // data if passed, modifies the user's avatar
        // TODO: pub banner: ?image, // data if passed, modifies the user's banner
    }

    /// https://discord.com/developers/docs/resources/user#get-current-user-guilds-query-string-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct GetCurrentUserGuilds {
        pub before: Snowflake, // get guilds before this guild ID (Default: absent)
        pub after: Snowflake, // get guilds after this guild ID (Default: absent)
        pub limit: u64, // max number of guilds to return (1-200) (Default: 200)
        pub with_counts: bool, // include approximate member and presence counts in response (Default: false)
    }

    /// https://discord.com/developers/docs/resources/user#create-dm-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct CreateDM {
        pub recipient_id: Snowflake, // the recipient to open a DM channel with
    }

    /// https://discord.com/developers/docs/resources/user#create-group-dm-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct CreateGroupDM {
        // TODO: pub access_tokens: array of strings, // access tokens of users that have granted your app the gdm.join scope
        // TODO: pub nicks: dict, // a dictionary of user ids to their respective nicknames
    }

    /// https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection-json-params
    #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
    pub struct UpdateCurrentUserApplicationRoleConnection {
        pub platform_name: Option<String>, // the vanity name of the platform a bot has connected (max 50 characters)
        pub platform_username: Option<String>, // the username on the platform a bot has connected (max 100 characters)
        // TODO: pub metadata?: object, // object mapping application role connection metadata keys to their string-ified value (max 100 characters) for the user on the platform a bot has connected
    }
}
