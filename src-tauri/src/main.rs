#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod tests;

mod discord;
mod events;
mod commands;
mod notifications;

mod main_app_state;

mod event_manager;

mod modules;
mod token_utils;
mod webview_packets;

#[allow(unused)]
mod dev;

extern crate tokio;

use std::sync::Arc;

use serde::Deserialize;
use tauri::{ Manager, UserAttentionType };
use tauri_plugin_log::LogTarget;
use windows::{
	Win32::{
		Graphics::Dwm::{ DwmSetWindowAttribute, DWMWA_WINDOW_CORNER_PREFERENCE, DwmExtendFrameIntoClientArea },
		Foundation::HWND,
		UI::{
			WindowsAndMessaging::{ SetWindowLongA, GWL_STYLE, WS_POPUP, SetWindowLongPtrA, SetWindowLongPtrW },
			Controls::MARGINS,
		},
	},
	core::CanInto,
};

use crate::main_app_state::MainState;

pub type Result<T, E = Box<dyn std::error::Error>> = std::result::Result<T, E>;

#[derive(Debug, Deserialize)]
struct TestData {}

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
fn close_loading(app: &mut tauri::App) -> Result<()> {
	let splashscreen_window = app.get_window("splashscreen").ok_or("No splashscreen window")?;
	let main_window = app.get_window("main").ok_or("No main window")?;
	splashscreen_window.close()?;
	main_window.show()?;
	Ok(())
}

fn enable_round_borders(window: tauri::Window) {
	if cfg!(windows) {
		let hwnd = windows::Win32::Foundation::HWND(window.hwnd().unwrap().0);
		unsafe {
			let margins = MARGINS {
				cxLeftWidth: 8,
				cxRightWidth: 8,
				cyTopHeight: 8,
				cyBottomHeight: 8,
			};

			let result = DwmExtendFrameIntoClientArea(hwnd, &margins);
			println!("DwmSetWindowAttribute: {:?}", result);
		}
	}
}

#[tokio::main]
async fn main() {
	println!("Starting");

	let event_manager = event_manager::EventManager::new();

	let main_state = Arc::new(MainState::new(event_manager));

	main_state.event_manager.lock().await.set_state(Arc::downgrade(&main_state));

	let m = main_state.clone();
	let m2 = main_state.clone();

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

			enable_round_borders(app_handle.get_window("main").unwrap());

			let path = app_handle.path_resolver().app_data_dir().unwrap();
			let main_state = m.clone();
			tokio::spawn(async move {
				main_state.update_user_manager_dir(path).await;
				main_state.user_manager.load_from_file().await.unwrap();
			});

			#[cfg(debug_assertions)]
			dev::add_token(&m, app_handle.clone());

			#[cfg(debug_assertions)]
			dev::clear_gateway_logs(app_handle.clone());

			//close_loading(app)?;

			Ok(())
		})
		.invoke_handler(
			tauri::generate_handler![
				commands::general::close_splashscreen,
				commands::general::set_state,
				commands::general::get_token,
				commands::general::get_users,
				commands::main_app::activate_user,
				commands::main_app::get_user_info,
				commands::main_app::send_voice_state_update,
				commands::main_app::start_voice_gateway,
				commands::main_app::send_to_voice_gateway,
				test
			]
		)
		.run(tauri::generate_context!())
		.expect("Error while running tauri application.");
	m2.user_manager.save_to_file().await.unwrap();
}
