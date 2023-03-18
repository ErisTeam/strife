#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod discord;
mod events;
mod notifications;

mod main_app_state;

mod event_manager;
mod manager;

mod modules;
mod token_utils;
mod webview_packets;

mod test;

extern crate tokio;

use std::sync::Arc;

use serde::Deserialize;
use tauri::{ Manager, State };
use windows::Win32::{ Foundation::{ BOOL }, UI::WindowsAndMessaging::FlashWindow };

use crate::{ main_app_state::MainState, manager::ThreadManager, discord::types::message::Message };

trait Flashing {
	fn set_flashing(&self, s: bool) -> Result<(), tauri::Error>;
}
impl Flashing for tauri::Window {
	fn set_flashing(&self, s: bool) -> Result<(), tauri::Error> {
		let winit_hwnd = self.hwnd()?;
		let h = windows::Win32::Foundation::HWND(winit_hwnd.0 as isize);
		unsafe {
			FlashWindow(h, BOOL(s as i32));
		}
		Ok(())
	}
}
/// Flashes **First** found window
pub fn flash_window(handle: &tauri::AppHandle) -> Result<(), tauri::Error> {
	let windows = handle.windows();
	let window = windows.iter().next().unwrap().1;
	Ok(window.set_flashing(true)?)
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

#[derive(Debug, Deserialize)]
struct TestData {}

#[cfg(debug_assertions)]
#[tauri::command]
async fn test(handle: tauri::AppHandle) {
	println!("test");

	let mut path = handle.path_resolver().app_cache_dir().unwrap();
	path.push("413428675866787863");
	path.set_extension("webp");
	println!("{:?}", path);

	//use notify_rust::Notification;

	use winrt_notification::Toast;

	notifications::new_message(Message::default(), &handle, None).await;
}

fn main() {
	println!("Starting");

	let main_state = Arc::new(MainState::new());

	let thread_manager = ThreadManager::new(main_state.clone());

	let event_manager = event_manager::EventManager::new(main_state.clone());

	*main_state.thread_manager.lock().unwrap() = Some(thread_manager);

	*main_state.event_manager.lock().unwrap() = Some(event_manager);

	let m = main_state.clone();

	#[cfg(debug_assertions)]
	test::add_token(&m);

	tauri::Builder
		::default()
		.manage(main_state)
		.setup(move |app| {
			let app_handle = app.handle();

			let splashscreen_window = app.get_window("splashscreen").unwrap();
			let main_window = app.get_window("main").unwrap();
			m.change_state(main_app_state::State::default_login_screen(), app_handle, false);
			splashscreen_window.close().unwrap();
			main_window.show().unwrap();
			println!("Closing Loading Screen");

			Ok(())
		})
		.invoke_handler(tauri::generate_handler![get_token, set_state, get_last_user, test])
		.run(tauri::generate_context!())
		.expect("Error while running tauri application.");
}