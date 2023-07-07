use std::sync::Arc;

use tauri::State;

use crate::main_app_state::MainState;

#[tauri::command]
pub async fn activate_user(
	user_id: String,
	state: State<'_, Arc<MainState>>,
	handle: tauri::AppHandle
) -> std::result::Result<(), String> {
	let token = {
		let user = state.user_manager.get_user(&user_id).await.ok_or("No user")?;
		user.token.ok_or("No token")?.to_string()
	};
	let state = state.state.read().await;
	let main_app = state.main_app().ok_or("Not in main app")?;

	let is_ready = main_app.activate_user(handle, token).await.or_else(|e| Err(e.to_string()))?;
	is_ready.notified().await; //TODO: add timeout maybe?

	Ok(())
}

//TODO: make all main_app events commands
