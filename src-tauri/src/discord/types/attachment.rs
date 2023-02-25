use serde::{ Serialize, Deserialize };

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attachment {
	id: String,
	filename: String,
	description: Option<String>,
	content_type: Option<String>,
	size: u64,
	url: String,
	proxy_url: String,
	height: Option<u64>,
	width: Option<u64>,
	ephemeral: Option<bool>,
}