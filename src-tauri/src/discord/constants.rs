use const_format::concatcp;

const DISCORD_API: &str = "https://discord.com/api/v9";

pub const MOBILE_AUTH: &str = "wss://remote-auth-gateway.discord.gg/?v=2";
pub const MOBILE_AUTH_GET_TOKEN: &str = concatcp!(DISCORD_API, "/users/@me/remote-auth/login");

pub const LOGIN: &str = concatcp!(DISCORD_API, "/auth/login");

pub const SMS_SEND: &str = concatcp!(DISCORD_API, "/auth/mfa/sms/send");

pub const VERIFY_SMS: &str = concatcp!(DISCORD_API, "/auth/mfa/sms");

pub const VERIFY_TOTP: &str = concatcp!(DISCORD_API, "/auth/mfa/totp");

pub const GATEWAY_CONNECT: &str = "wss://gateway.discord.gg/?encoding=json&v=9&compress=zlib-stream";

pub const GET_CHANNEL: &str = concatcp!(DISCORD_API, "/channels/");

pub const GET_RELATIONSHIPS: &str = concatcp!(DISCORD_API, "/users/@me/relationships");
