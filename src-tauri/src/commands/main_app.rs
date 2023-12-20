use std::{ sync::Arc, collections::HashMap, f32::consts::E };

use chrono::Duration;
use log::{ debug, warn, info, error };
use tauri::State;

use crate::{
	main_app_state::MainState,
	discord::types::{
		user::CurrentUser,
		gateway::gateway_packets_data::{ VoiceStateUpdateSend, LazyGuilds, LazyGuildsChannels },
		channel,
		SnowFlake,
	},
	modules::{ gateway::LazyGuildsMessage, main_app::GuildState },
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
pub async fn request_channels_recipients(
	guild_id: String,
	user_id: String,
	channels: Vec<SnowFlake>,
	state: State<'_, Arc<MainState>>
) -> Result<(), ()> {
	let state = state.state.read().await;
	let main_app = state.main_app().ok_or("Not in main app").unwrap();
	println!("Requesting channels recipients, user_id: {}, guild_id: {}", user_id, guild_id);

	let mut guild_states = main_app.guilds_state.write().await;
	let guild_state = if let Some(guild) = guild_states.get_mut(&guild_id) {
		guild
	} else {
		guild_states.insert(guild_id.clone(), GuildState::default());
		guild_states.get_mut(&guild_id).unwrap()
	};

	let mut lazy_channels = HashMap::new();
	for channel in channels {
		if let Some(s) = guild_state.channels.get_mut(&channel) {
			let c = [*s, *s + 99];
			lazy_channels.insert(channel.clone(), c);
			*s += 100;
		} else {
			lazy_channels.insert(channel.clone(), [0, 99]);
			guild_state.channels.insert(channel.clone(), 100);
		}
	}
	let payload = LazyGuilds {
		channels: Some(lazy_channels),
		guild_id,
		..Default::default()
	};
	main_app.send_to_gateway(&user_id, crate::modules::gateway::Messages::RequestLazyGuilds(payload)).await.unwrap();

	Ok(())
}

#[tauri::command]
pub async fn request_lazy_guilds(
	guild_id: String,
	user_id: String,
	typing: Option<bool>,
	threads: Option<bool>,
	activities: Option<bool>,
	channels: Option<Vec<(SnowFlake, bool)>>,
	members: Option<bool>,
	state: State<'_, Arc<MainState>>
) -> Result<(), ()> {
	let state = state.state.read().await;
	let main_app = state.main_app().expect("Not in main app");
	println!("Requesting lazy guilds, user_id: {}, guild_id: {}", user_id, guild_id);

	let mut typing = typing;
	let mut threads = threads;
	let mut activities = activities;
	let mut members = members;

	let a = main_app.guilds_state.read().await;
	let b = a.get(&guild_id);

	let channels = if let Some(channels) = channels {
		let mut lazy_channels = HashMap::new();

		if let Some(guild) = b {
			for channel in channels {
				if channel.1 {
					lazy_channels.insert(channel.0, [0, 99]);
					continue;
				}
				if let Some(last_index) = guild.channels.get(&channel.0) {
					lazy_channels.insert(channel.0, [*last_index + 1, *last_index + 99]);
				}
			}
		} else {
			for channel in channels {
				lazy_channels.insert(channel.0, [0, 99]);
			}
		}
		Some(lazy_channels)
	} else {
		None
	};

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
	// let timeout = tokio::time::timeout(std::time::Duration::from_secs(10), reciver).await;
	// if timeout.is_err() {
	// 	error!("Request lazy guilds timed out");
	// 	return Err(());
	// } else {
	// 	info!("Request lazy guilds finished");
	// 	//
	// }

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
