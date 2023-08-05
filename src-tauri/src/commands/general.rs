use std::sync::Arc;

use log::{ debug, warn, error, info };
use serde::Serialize;
use tauri::{ State, Manager };
use thiserror::Error;

use crate::{ main_app_state::MainState, modules::{ main_app::MainApp, auth::Auth, user_manager } };

type Result<T, E = GeneralError> = std::result::Result<T, E>;

#[derive(Debug, Serialize)]
pub enum GeneralResponse {
	Ok,
	StateIsAlreadySet(String),
}

#[derive(Debug, Serialize, Error)]
pub enum GeneralError {
	#[error("User not found")]
	UserNotFound,
	#[error("Token not found")]
	TokenNotFound,
	#[error("Unknown state")]
	UnknownState,
	#[error("Other error: {0}")] Other(String),
}

#[tauri::command]
pub async fn set_state(
	new_state: String,
	force: Option<bool>,
	state: State<'_, Arc<MainState>>,
	handle: tauri::AppHandle
) -> std::result::Result<GeneralResponse, GeneralError> {
	debug!("Change state {}", new_state);
	let force = force.unwrap_or(false);
	if !force && state.state.read().await.get_name() == new_state {
		warn!("State already set to {}", new_state);
		debug!("USE force=true to force change state");
		return Ok(GeneralResponse::StateIsAlreadySet(new_state));
	}
	state.reset_state().await;
	match new_state.as_str() {
		"Application" => {
			let main_app = MainApp::new();
			let new_state = crate::main_app_state::State::MainApp(main_app);
			state.change_state(new_state, handle).await.map_err(|e| GeneralError::Other(e.to_string()))?;
		}
		"LoginScreen" => {
			let mut auth = Auth::new(Arc::downgrade(&state));
			auth.start_gateway(handle.clone()).await.map_err(|e| GeneralError::Other(e.to_string()))?;
			let new_state = crate::main_app_state::State::LoginScreen(auth);

			state.change_state(new_state, handle).await.map_err(|e| GeneralError::Other(e.to_string()))?;
		}
		"Dev" => {
			let new_state = crate::main_app_state::State::Dev;
			state.change_state(new_state, handle).await.map_err(|e| GeneralError::Other(e.to_string()))?;
		}
		_ => {
			error!("Unknown state {}", new_state);
			return Err(GeneralError::UnknownState);
		}
	}
	debug!("Changed state to: {}", new_state);
	println!("SUCCESS");
	Ok(GeneralResponse::Ok)
}

#[tauri::command]
pub async fn close_splashscreen(window: tauri::Window) -> Result<()> {
	// Close splashscreen
	if let Some(splashscreen) = window.get_window("splashscreen") {
		splashscreen.close().unwrap(); //TODO: handle error
	}
	// Show main window
	window.get_window("main").unwrap().show().unwrap(); //TODO: handle error
	info!("Closing Loading Screen");
	Ok(())
}

#[tauri::command]
pub async fn get_token(user_id: String, state: State<'_, Arc<MainState>>) -> Result<String, GeneralError> {
	Ok(
		state.user_manager
			.get_user(&user_id).await
			.ok_or(GeneralError::UserNotFound)?
			.token.ok_or(GeneralError::TokenNotFound)?
			.to_string()
	)
}

#[tauri::command]
pub async fn get_users(state: State<'_, Arc<MainState>>) -> Result<serde_json::Value> {
	#[derive(Serialize)]
	#[serde(rename_all = "camelCase")]
	struct BasicUserInfo {
		state: user_manager::State,
		user_id: String,
		global_name: Option<String>,
		avatar: Option<String>,
	}
	let mut users = Vec::new();
	for (user_id, data) in &state.user_manager.get_all_users().await {
		let user = BasicUserInfo {
			state: data.state.clone(),
			user_id: user_id.clone(),
			global_name: data.global_name.clone(),
			avatar: data.avatar_hash.clone(),
		};
		users.push(user);
	}
	Ok(serde_json::to_value(users).unwrap())
}
