#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod tests;

mod discord;
mod events;
mod notifications;

mod main_app_state;

mod event_manager;
mod manager;

mod modules;
mod token_utils;
mod webview_packets;

mod dev;

extern crate tokio;

use std::sync::Arc;

use log::{ debug, error, warn };
use serde::Deserialize;
use tauri::{ Manager, State, UserAttentionType };
use tauri_plugin_log::LogTarget;

use crate::{ main_app_state::MainState, manager::ThreadManager, modules::auth::Auth };

pub type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;

#[tauri::command]
async fn set_state(
	new_state: String,
	force: Option<bool>,
	state: State<'_, Arc<MainState>>,
	handle: tauri::AppHandle
) -> std::result::Result<(), String> {
	debug!("change state {}", new_state);
	let force = force.unwrap_or(false);
	if !force && state.state.lock().unwrap().get_name() == new_state {
		warn!("State already set to {}", new_state);
		debug!("USE force=true to force change state");
		return Ok(());
	}
	state.reset_state();
	match new_state.as_str() {
		"Application" => {
			let s = crate::main_app_state::State::MainApp();
			state.change_state(s, handle).await.or_else(|e| Err(e.to_string()))?;
		}
		"LoginScreen" => {
			let auth = Auth::new(Arc::downgrade(&state));
			let auth = auth.start_gateway(handle.clone()).await.or_else(|e| Err(e.to_string()))?;
			let s = crate::main_app_state::State::LoginScreen(auth);

			state.change_state(s, handle).await.or_else(|e| Err(e.to_string()))?;
		}
		"Dev" => {
			let s = crate::main_app_state::State::Dev;
			state.change_state(s, handle).await.or_else(|e| Err(e.to_string()))?;
		}
		_ => {
			error!("Unknown state {}", new_state);
			return Err("Unknown state".to_string());
		}
	}
	Ok(())
}

#[tauri::command]
fn get_token(user_id: String, state: State<Arc<MainState>>) -> Option<String> {
	state.get_token(user_id)
}

#[tauri::command]
fn get_last_user(state: State<Arc<MainState>>) -> Option<String> {
	println!("get_last_user");
	println!("{:?}", state.last_id.lock().unwrap());
	state.last_id.lock().unwrap().clone()
}
#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
	// Close splashscreen
	if let Some(splashscreen) = window.get_window("splashscreen") {
		splashscreen.close().unwrap();
	}
	// Show main window
	window.get_window("main").unwrap().show().unwrap();
	println!("Closing Loading Screen");
}

#[derive(Debug, Deserialize)]
struct TestData {}

#[cfg(debug_assertions)]
#[tauri::command]
async fn test(handle: tauri::AppHandle) {
	println!("test");

	// let mut path = handle.path_resolver().app_cache_dir().unwrap();
	// path.push("413428675866787863");
	// path.set_extension("webp");
	// println!("{:?}", path);
	let windows = handle.windows();
	let window = windows.iter().next().unwrap().1;
	tokio::time::sleep(Duration::from_millis(1000)).await;
	window.request_user_attention(Some(UserAttentionType::Informational)).unwrap();
	println!("test");

	//use notify_rust::Notification;

	use std::time::Duration;

	//use winrt_notification::Toast;

	//notifications::new_message(Message::default(), &handle, None).await;
}

fn main() {
	println!("Starting");

	let event_manager = event_manager::EventManager::new();

	let main_state = Arc::new(MainState::new(event_manager));

	main_state.event_manager.lock().unwrap().set_state(Arc::downgrade(&main_state));

	let thread_manager = ThreadManager::new(main_state.clone());

	*main_state.thread_manager.lock().unwrap() = Some(thread_manager);

	//*main_state.event_manager.lock().unwrap() = Some(event_manager);

	let m = main_state.clone();

	#[cfg(debug_assertions)]
	tauri::Builder
		::default()
		.plugin(
			tauri_plugin_log::Builder
				::default()
				.targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
				.build()
		)
		.manage(main_state)
		.setup(move |app| {
			let app_handle = app.handle();
			dev::add_token(&m, app_handle.clone());
			m.change_state_old(main_app_state::StateOld::default_login_screen(), app_handle, false);

			let splashscreen_window = app.get_window("splashscreen").unwrap();
			let main_window = app.get_window("main").unwrap();
			splashscreen_window.close().unwrap();
			main_window.show().unwrap();

			Ok(())
		})
		.invoke_handler(tauri::generate_handler![get_token, set_state, get_last_user, close_splashscreen, test])
		.run(tauri::generate_context!())
		.expect("Error while running tauri application.");
}
