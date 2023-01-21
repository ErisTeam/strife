#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod discord;
mod modules;
mod webview_packets;
mod main_app_state;
mod manager;

extern crate tokio;

use std::{ sync::{ Mutex, Arc } };

use tauri::{ State };
use tokio::sync::mpsc;

use crate::{ main_app_state::MainState, manager::ThreadManager };
#[tauri::command]
fn get_qrcode(state: State<Arc<MainState>>) -> String {
    println!("test");
    state.send(manager::Messages::Start { what: manager::Modules::MobileAuth });
    format!("no {:?}", state.state.lock().unwrap())
}
#[tauri::command]
fn get_token(id: String, state: State<Arc<MainState>>) -> Option<String> {
    //state.tokens_old.lock().unwrap()[0].clone()
    state.tokens.lock().unwrap().get(&id).cloned()
}

fn main() {
    println!("Starting");

    let (input, rec) = mpsc::channel(32);

    let main_state = Arc::new(MainState::new(Mutex::new(input)));

    let mut m = ThreadManager::new(main_state.clone(), rec);

    tauri::Builder
        ::default()
        .manage(main_state)
        .setup(|app| {
            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                m.run(app_handle).await;
            });
            Ok(())
        })

        .invoke_handler(tauri::generate_handler![get_qrcode, get_token])

        .run(tauri::generate_context!())
        .expect("Error while running tauri application.");
}