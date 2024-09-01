use serde::{Deserialize, Serialize};
use super::snowflake::Snowflake;
use super::user::User;

#[derive(Debug, Default, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize, Serialize)]
pub struct Emoji {
    /// The ID of the emoji
    pub id: Option<Snowflake>,
    /// The name of the emoji (2-32 characters)
    pub name: Option<String>,
    /// The roles allowed to use the emoji
    #[serde(skip_serializing_if = "Option::is_none")]
    pub roles: Option<Vec<Snowflake>>,
    /// The user that uploaded the emoji
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user: Option<User>,
    /// Whether this emoji must be wrapped in colons
    #[serde(skip_serializing_if = "Option::is_none")]
    pub require_colons: Option<bool>,
    /// Whether this emoji is managed
    #[serde(skip_serializing_if = "Option::is_none")]
    pub managed: Option<bool>,
    /// Whether this emoji is animated
    #[serde(skip_serializing_if = "Option::is_none")]
    pub animated: Option<bool>,
    /// Whether this emoji can be used; may be false due to loss of premium subscriptions (boosts)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub available: Option<bool>,
}
