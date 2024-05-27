use serde::{ Serialize, Deserialize };

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreadMember {
	//TODO implement
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreadMetadata {
	archived: bool,
	auto_archive_duration: u64,
	archive_timestamp: String,
	locked: bool,
	invitable: Option<bool>,
	created_timestamp: Option<String>,
}
