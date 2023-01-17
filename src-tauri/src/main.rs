#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod discord;
mod gateway_handler;

extern crate tokio;

use std::{ sync::{ Mutex } };

use tauri::{ State, Manager };
use tokio::sync::mpsc;
use websocket::{ OwnedMessage };

use crate::{ gateway_handler::DiscordGateway };

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn test(login: &str, password: &str, state: State<test>) -> String {
    format!("no ")
}
struct test {
    sender: Mutex<mpsc::Sender<OwnedMessage>>,
}

fn rs2js<R: tauri::Runtime>(message: String, manager: &impl Manager<R>) {
    manager.emit_all("rs2js", message).unwrap();
}

fn main() {
    use websocket::client::r#async::Client;
    println!("Starting");

    let mut gate = DiscordGateway::new();

    let (async_proc_input_tx, async_proc_input_rx) = mpsc::channel(1);
    let (async_proc_output_tx, mut async_proc_output_rx) = mpsc::channel::<String>(1);

    let t = test { sender: Mutex::new(async_proc_input_tx) };

    tauri::Builder
        ::default()
        .manage(t)
        .setup(|app| {
            //

            tauri::async_runtime::spawn(async move {
                gate.generate_keys();
                gate.connect(async_proc_input_rx, async_proc_output_tx).await;
            });
            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                loop {
                    if let Some(output) = async_proc_output_rx.recv().await {
                        rs2js(output, &app_handle);
                    }
                }
            });
            Ok(())
        })

        .invoke_handler(tauri::generate_handler![greet, test])

        .run(tauri::generate_context!())
        .expect("Error while running tauri application.");
}