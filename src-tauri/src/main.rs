#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod commands;
mod discord;
mod main_app_state;

mod manager;
mod event_manager;

mod modules;
mod webview_packets;
mod token_utils;

extern crate tokio;

use std::sync::{ Arc };

use tauri::{ State };

use crate::{ main_app_state::MainState, manager::ThreadManager };

#[tauri::command]
fn set_state(new_state: String, state: State<Arc<MainState>>, handle: tauri::AppHandle) {
	println!("change state {}", new_state);
	match new_state.as_str() {
		"Application" => {
			if matches!(*state.state.lock().unwrap(), main_app_state::State::MainApp { .. }) {
				println!("Already in main app");
				return;
			}
			state.change_state(main_app_state::State::MainApp {}, handle)
		}
		"LoginScreen" => {
			if matches!(*state.state.lock().unwrap(), main_app_state::State::LoginScreen { .. }) {
				println!("Already in login screen");
				return;
			}
			state.change_state(
				main_app_state::State::LoginScreen {
					qr_url: String::new(),
					captcha_token: None,
					ticket: None,
					use_mfa: false,
				},
				handle
			);
		}
		_ => {
			println!("Unknown state {}", new_state);
		}
	}
}

// TODO: Move this to cammands.rs
#[tauri::command]
fn get_token(id: String, state: State<Arc<MainState>>) -> Option<String> {
	state.tokens.lock().unwrap().get(&id).cloned()
}

#[tauri::command]
fn get_last_user(state: State<Arc<MainState>>) -> Option<String> {
	state.last_id.lock().unwrap().clone()
}

fn main() {
	println!("Starting");

	let main_state = Arc::new(MainState::new());

	let thread_manager = ThreadManager::new(main_state.clone());

	let event_manager = event_manager::EventManager::new(main_state.clone());

	*main_state.thread_manager.lock().unwrap() = Some(thread_manager);

	*main_state.event_manager.lock().unwrap() = Some(event_manager);

	let m = main_state.clone();

	tauri::Builder
		::default()
		.manage(main_state)
		.setup(move |app| {
			let app_handle = app.handle();
			m.change_state(
				main_app_state::State::LoginScreen {
					qr_url: String::new(),
					captcha_token: None,
					ticket: None,
					use_mfa: false,
				},
				app_handle
			);
			Ok(())
		})
		.invoke_handler(
			tauri::generate_handler![
				get_token,
				set_state,
				commands::auth::login,
				commands::auth::send_sms,
				commands::auth::verify_login,
				commands::auth::start_mobile_auth
			]
		)
		.run(tauri::generate_context!())
		.expect("Error while running tauri application.");
}