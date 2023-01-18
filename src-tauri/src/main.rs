#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod discord;
mod mobile_auth_gateway_handler;
mod webview_packets;
mod main_app_state;

extern crate tokio;

use std::{ sync::{ Mutex, Arc } };

use tauri::{ Manager };
use tokio::sync::mpsc;
use websocket::{ OwnedMessage };

use crate::{ mobile_auth_gateway_handler::MobileAuthHandler, main_app_state::MainState };

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn test(
    login: &str,
    password: &str
    //   , state: State<Arc<test_state>>
) -> String {
    //let mut s = state.state.lock().unwrap();
    //*s += 1;
    format!("no ")
}
//todo move to seperate file
struct test {
    sender: Mutex<mpsc::Sender<OwnedMessage>>,
}

struct test_state {
    pub state: Mutex<i32>,
}

struct test2 {
    s: Arc<test_state>,
}

fn mobile_auth_event<R: tauri::Runtime>(message: String, manager: &impl Manager<R>) {
    manager.emit_all("mobileAuth", message).unwrap();
}

fn main() {
    use websocket::client::r#async::Client;
    println!("Starting");

    let main_state = Arc::new(MainState::new());

    let mut gate = MobileAuthHandler::new(main_state.clone());

    let (async_proc_input_tx, async_proc_input_rx) = mpsc::channel(32);
    let (async_proc_output_tx, mut async_proc_output_rx) =
        mpsc::channel::<webview_packets::MobileAuth>(32);

    let t = test { sender: Mutex::new(async_proc_input_tx) };

    //let tt = Arc::new(test_state { state: Mutex::new(0) });
    //let a = test2 { s: tt.clone() };

    tauri::Builder
        ::default()
        .manage(t)
        //.manage(tt)
        .setup(|app| {
            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                loop {
                    let r = async_proc_output_rx.try_recv();
                    if r.is_ok() {
                        let output = r.unwrap();
                        println!("recived: {:?}", output);
                        mobile_auth_event(serde_json::to_string(&output).unwrap(), &app_handle);
                    }
                }
            });
            // tauri::async_runtime::spawn(async move {
            //     loop {
            //         println!("{:?}", a.s.state.lock().unwrap());
            //         //sleep 1 second
            //         tokio::time::sleep(std::time::Duration::from_secs(1)).await;
            //     }
            // });
            tauri::async_runtime::spawn(async move {
                gate.generate_keys();
                gate.run(async_proc_input_rx, async_proc_output_tx).await;
            });

            Ok(())
        })

        .invoke_handler(tauri::generate_handler![greet, test])

        .run(tauri::generate_context!())
        .expect("Error while running tauri application.");
}