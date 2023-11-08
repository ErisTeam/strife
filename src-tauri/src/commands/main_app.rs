use std::{ sync::Arc, collections::HashMap };

use log::{ debug, warn };
use tauri::State;

use crate::{
	main_app_state::MainState,
	discord::types::{
		user::CurrentUser,
		gateway::gateway_packets_data::{ VoiceStateUpdateSend, LazyGuilds, LazyGuildsChannels },
	},
};

#[tauri::command]
pub async fn activate_user(
	user_id: String,
	state: State<'_, Arc<MainState>>,
	handle: tauri::AppHandle
) -> std::result::Result<(), String> {
	debug!("Activating user {}", user_id);
	let token = {
		let user = state.user_manager.get_user(&user_id).await.ok_or("No user")?;
		user.token.ok_or("No token")?.to_string()
	};
	debug!("Got token: {}", token);
	let state = state.state.read().await;
	let main_app = state.main_app().ok_or("Not in main app")?;

	let users = main_app.users.read().await;
	if users.get(&user_id).is_some() {
		warn!("User already being activated or is Activated");
		return Err("User already being activated or is Activated".into());
	}
	drop(users);

	debug!("Creating notifyer");

	let is_ready = main_app.activate_user(handle, token).await.map_err(|e| e.to_string())?;
	debug!("Waiting for user to be ready");
	is_ready.notified().await; //TODO: add timeout maybe?

	Ok(())
}
#[tauri::command]
pub async fn get_user_info(
	user_id: String,
	state: State<'_, Arc<MainState>>
) -> std::result::Result<CurrentUser, String> {
	let state = state.state.read().await;
	let main_app = state.main_app().ok_or("Not in main app")?;

	let user = main_app.get_user(&user_id).await.ok_or("No user")?;
	let user_data = user.read_user_data().await;

	if let Some(user_data) = user_data.as_ref() {
		return Ok(user_data.user.clone());
	}
	Err("No user data".into())
}

#[tauri::command]
pub async fn send_voice_state_update(
	user_id: String,
	guild_id: String,
	channel_id: String,
	state: State<'_, Arc<MainState>>
) -> std::result::Result<(), String> {
	let state = state.state.read().await;
	let main_app = state.main_app().expect("Not in main app");
	println!("Sending voice state update, user_id: {}, guild_id: {}, channel_id: {}", user_id, guild_id, channel_id);

	main_app
		.send_to_gateway(
			&user_id,
			crate::modules::gateway::Messages::UpdateVoiceState(VoiceStateUpdateSend {
				guild_id,
				channel_id,
				..Default::default()
			})
		).await
		.map_err(|e| e.to_string())?;
	Ok(())
}
#[tauri::command]
pub async fn request_lazy_guilds(
	guild_id: String,
	user_id: String,
	typing: Option<bool>,
	threads: Option<bool>,
	activities: Option<bool>,
	channels: Option<LazyGuildsChannels>,
	members: Option<bool>,
	state: State<'_, Arc<MainState>>
) -> Result<(), ()> {
	let state = state.state.read().await;
	let main_app = state.main_app().expect("Not in main app");
	println!("Requesting lazy guilds, user_id: {}, guild_id: {}", user_id, guild_id);

	let a = main_app.guilds_state.write().await;
	let b = a.get(&guild_id);

	main_app
		.send_to_gateway(
			&user_id,
			crate::modules::gateway::Messages::RequestLazyGuilds(LazyGuilds {
				typing,
				threads,
				activities,
				guild_id,
				channels,
				members,
			})
		).await
		.unwrap();
	Ok(())
}

//TODO: make all main_app events commands
///TEMPORARY COMMAND
#[tauri::command]
pub async fn start_voice_gateway(
	handle: tauri::AppHandle,
	user_id: String,
	guild_id: String,
	endpoint: String,
	session_id: String,
	voice_token: String,
	state: State<'_, Arc<MainState>>
) -> std::result::Result<(), String> {
	let state = state.state.read().await;
	let main_app = state.main_app().expect("Not in main app");
	debug!("Starting voice gateway");
	main_app
		.start_voice_gateway(handle, user_id, guild_id, endpoint, session_id, voice_token).await
		.map_err(|e| e.to_string())?;
	debug!("Started voice gateway");
	Ok(())
}
///TEMPORARY COMMAND
#[tauri::command]
pub async fn send_to_voice_gateway(
	packet: String,
	state: State<'_, Arc<MainState>>
) -> std::result::Result<(), String> {
	let state = state.state.read().await;
	let main_app = state.main_app().expect("Not in main app");

	let voice_gateway = main_app.voice_gateway.write().await;
	if let Some(voice_gateway) = voice_gateway.as_ref() {
		voice_gateway
			.send_message(crate::modules::main_app::VoiceGatewayMessages::Packet(packet)).await
			.map_err(|e| e.to_string())?;
	} else {
		return Err("No voice gateway".into());
	}
	Ok(())
}
