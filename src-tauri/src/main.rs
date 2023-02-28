#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod commands;
mod events;
mod discord;

mod main_app_state;

mod manager;
mod event_manager;

mod modules;
mod webview_packets;
mod token_utils;

extern crate tokio;

use std::sync::{ Arc };

use tauri::{ State, api::notification::Notification, Manager, Window };
use windows::Win32::{ UI::WindowsAndMessaging::FlashWindow, Foundation::{ BOOLEAN, BOOL } };

use crate::{ main_app_state::MainState, manager::ThreadManager };

trait test {
	fn set_flashing(&self, s: bool) -> Result<(), tauri::Error>;
}
impl test for tauri::Window {
	fn set_flashing(&self, s: bool) -> Result<(), tauri::Error> {
		let winit_hwnd = self.hwnd()?;
		let h = windows::Win32::Foundation::HWND(winit_hwnd.0 as isize);
		unsafe {
			FlashWindow(h, BOOL(s as i32));
		}
		Ok(())
	}
}

#[tauri::command]
fn set_state(new_state: String, state: State<Arc<MainState>>, handle: tauri::AppHandle) {
	println!("change state {}", new_state);
	match new_state.as_str() {
		"Application" => {
			println!("Application");
			if matches!(*state.state.lock().unwrap(), main_app_state::State::MainApp { .. }) {
				println!("Already in main app");
				return;
			}
			state.change_state(main_app_state::State::MainApp {}, handle, false)
		}
		"LoginScreen" => {
			if matches!(*state.state.lock().unwrap(), main_app_state::State::LoginScreen { .. }) {
				println!("Already in login screen");
				return;
			}
			state.change_state(main_app_state::State::default_login_screen(), handle, false);
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

#[tauri::command]
fn test(handle: tauri::AppHandle) {
	println!("test");
	Notification::new(&handle.config().tauri.bundle.identifier)
		.title("??????")
		.body("Gami to furras")
		.icon(
			format!(
				"https://cdn.discordapp.com/avatars/${}/${}.webp?size=128",
				"362958640656941056",
				"0ad17e3c13fd7de38cbdd82e34cac15d"
			)
		)
		.show()
		.unwrap();
	let mut window = None;
	for e in handle.windows() {
		window = Some(e.1);
		break;
	}
	window.unwrap().set_flashing(true).unwrap()
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
					qr_url: None,
					captcha_token: None,
					ticket: None,
					use_mfa: false,
				},
				app_handle,
				false
			);

			Ok(())
		})
		.invoke_handler(
			tauri::generate_handler![
				get_token,
				set_state,
				get_last_user,

				test,

				commands::auth::start_mobile_auth // todo remove
			]
		)
		.run(tauri::generate_context!())
		.expect("Error while running tauri application.");
}