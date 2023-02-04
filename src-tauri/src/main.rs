#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod commands;
mod discord;
mod main_app_state;
mod manager;
mod modules;
mod webview_packets;
mod token_utils;

extern crate tokio;

use std::sync::{ Arc, Mutex };

use modules::auth::{ Auth, LoginResponse };
use serde::{ Serialize, Deserialize };
use tauri::{ State };
use tokio::sync::mpsc;

use crate::{ main_app_state::MainState, manager::ThreadManager };

#[tauri::command]
fn set_state(state: String, s: State<Arc<MainState>>) {
	println!("change state {}", state);
}

// TODO: Move this to cammands.rs
#[tauri::command]
fn get_token(id: String, state: State<Arc<MainState>>) -> Option<String> {
	state.tokens.lock().unwrap().get(&id).cloned()
}

fn main() {
	println!("Starting");

	let main_state = Arc::new(MainState::new());

	let thread_manager = ThreadManager::new(main_state.clone());

	*main_state.thread_manager.lock().unwrap() = Some(thread_manager);

	tauri::Builder
		::default()
		.manage(main_state)
		.setup(|app| {
			let app_handle = app.handle();

			Ok(())
		})
		.invoke_handler(
			tauri::generate_handler![
				get_token,
				commands::auth::login,
				commands::auth::send_sms,
				commands::auth::verify_login,
				commands::auth::start_mobile_auth,
				set_state
			]
		)
		.run(tauri::generate_context!())
		.expect("Error while running tauri application.");
}