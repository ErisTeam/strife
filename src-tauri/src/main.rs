#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod discord;
mod modules;
mod webview_packets;
mod main_app_state;
mod manager;
mod commands;

extern crate tokio;

use std::{ sync::{ Mutex, Arc } };

use modules::login::Login;
use tauri::{ State };
use tokio::sync::mpsc;

use crate::{ main_app_state::MainState, manager::ThreadManager };

// TODO: Move this to cammands.rs
#[tauri::command]
fn get_qrcode(state: State<Arc<MainState>>) -> Option<String> {
    println!("GtF");
    state.send(manager::Messages::Start { what: manager::Modules::MobileAuth })
}

// TODO: Move this to cammands.rs
#[tauri::command]
fn get_token(id: String, state: State<Arc<MainState>>) -> Option<String> {
    state.tokens.lock().unwrap().get(&id).cloned()
}

#[tauri::command]
async fn login(captcha_token: Option<String>, login: String, password: String) -> String {
	let a = Login::new();
	return serde_json::to_string(&a.login(captcha_token, login, password).await).unwrap();
}

fn main() {
	println!("Starting");

    let (input, rec) = mpsc::channel(32);
    let main_state = Arc::new(MainState::new(Mutex::new(input)));
    let mut thread_manager = ThreadManager::new(main_state.clone(), rec);

    tauri::Builder
        ::default()
        .manage(main_state)
        .setup(|app| {
            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                thread_manager.run(app_handle).await;
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_qrcode, get_token])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application.");
}