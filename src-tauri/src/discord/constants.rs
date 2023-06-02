pub const MOBILE_AUTH: &str = "wss://remote-auth-gateway.discord.gg/?v=2";
pub const MOBILE_AUTH_GET_TOKEN: &str = "https://discord.com/api/v9/users/@me/remote-auth/login";

pub const LOGIN: &str = "https://discord.com/api/v9/auth/login";

pub const SMS_SEND: &str = "https://discord.com/api/v9/auth/mfa/sms/send";

pub const VERIFY_SMS: &str = "https://discord.com/api/v9/auth/mfa/sms";

pub const VERIFY_TOTP: &str = "https://discord.com/api/v9/auth/mfa/totp";

pub const GATEWAY_CONNECT: &str = "wss://gateway.discord.gg/?encoding=json&v=9&compress=zlib-stream";

pub const GET_CHANNEL: &str = "https://discord.com/api/v9/channels/";

pub const GET_RELATIONSHIPS: &str = "https://discord.com/api/v9/users/@me/relationships";
