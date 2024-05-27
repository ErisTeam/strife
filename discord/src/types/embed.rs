use serde::{ Serialize, Deserialize };

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Embed {
	pub title: Option<String>,

	pub r#type: Option<String>,
	pub description: Option<String>,
	pub url: Option<String>,
	pub timestamp: Option<String>,
	pub color: Option<u64>,
	pub footer: Option<EmbedFooter>,
	pub image: Option<EmbedImage>,
	pub thumbnail: Option<EmbedThumbnail>,
	pub video: Option<EmbedVideo>,
	pub provider: Option<EmbedProvider>,
	pub author: Option<EmbedAuthor>,
	pub fields: Option<Vec<EmbedField>>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbedFooter {
	pub text: String,
	pub icon_url: Option<String>,
	pub proxy_icon_url: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbedImage {
	pub url: String,
	pub proxy_url: Option<String>,
	pub height: Option<u64>,
	pub width: Option<u64>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbedThumbnail {
	pub url: String,
	pub proxy_url: Option<String>,
	pub height: Option<u64>,
	pub width: Option<u64>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbedVideo {
	pub url: Option<String>,
	pub proxy_url: Option<String>,
	pub height: Option<u64>,
	pub width: Option<u64>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbedProvider {
	pub name: Option<String>,
	pub url: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbedAuthor {
	pub name: String,
	pub url: Option<String>,
	pub icon_url: Option<String>,
	pub proxy_icon_url: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbedField {
	pub name: String,
	pub value: String,
	pub inline: Option<bool>,
}