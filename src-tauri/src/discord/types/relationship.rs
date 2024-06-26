use serde::{ Deserialize, Serialize };
use serde_repr::{ Deserialize_repr, Serialize_repr };

use super::user::PublicUser;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GatewayRelationship {
	pub id: String,
	pub nickname: Option<String>,
	pub r#type: RelationshipType,
	pub user_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Relationship {
	pub id: String,
	pub nickname: Option<String>,
	pub r#type: RelationshipType,
	pub user: PublicUser,
}
impl Relationship {
	pub fn from_gateway_relationship(gateway_relationship: GatewayRelationship, user: PublicUser) -> Self {
		Self {
			id: gateway_relationship.id,
			nickname: gateway_relationship.nickname,
			r#type: gateway_relationship.r#type,
			user,
		}
	}
}

#[derive(Debug, Clone, Serialize_repr, Deserialize_repr)]
#[repr(u8)]
pub enum RelationshipType {
	None,
	Friend,
	Block,
	IncomingFriendRequest,
	OutgoingFriendRequest,
	Implicit,
}
