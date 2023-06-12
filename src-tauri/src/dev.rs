use crate::main_app_state::MainState;

use std::{ fs, path::Path };

pub fn add_token(m: &MainState, handle: tauri::AppHandle) {
	let path = handle.path_resolver().app_data_dir().unwrap().into_os_string().into_string();
	let path = Path::new(&path.unwrap()).join("token.json");

	println!("Looking for token file at {}", path.display());
	if !path.exists() {
		println!("Failed to find token file");
		return;
	}
	let file = fs::File::open(path).unwrap();
	#[derive(serde::Deserialize)]
	struct Token {
		token: String,
		id: String,
	}
	let token: Token = serde_json::from_reader(file).unwrap();
	println!("token Found {}", token.id);
	m.add_new_user(token.id, token.token.clone());
}

pub async fn gami_to_furras(token: String, gami: bool) {
	use base64::Engine;
	use prost::Message;
	use serde_json::json;
	use crate::discord::types::protos::discord_protos::discord_users::v1::preloaded_user_settings::{
		PreloadedUserSettings,
		preloaded_user_settings::{ StatusSettings, CustomStatus },
	};
	let mut settings = PreloadedUserSettings::default();
	let mut status_settings = StatusSettings::default();
	status_settings.status = Some("online".to_string());
	let mut status = CustomStatus::default();
	if gami {
		status.text = "I'm a furry".to_string();
		status.emoji_name = "🐶".to_string();
	} else {
		status.text = "Gami to Furras".to_string();
	}

	status_settings.custom_status = Some(status);

	settings.status = Some(status_settings);

	let mut buf = Vec::new();
	settings.encode(&mut buf).unwrap();

	let encoded = base64::engine::general_purpose::STANDARD.encode(buf);

	let client = reqwest::Client::new();
	let res = client
		.patch("https://discord.com/api/v9/users/@me/settings-proto/1")
		.header("Authorization", token)
		.json(&json!({ "settings": encoded }))
		.send().await
		.unwrap();
	println!("{:?}", res.text().await);
}
