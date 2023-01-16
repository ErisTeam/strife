#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod discord;
mod gateway_handler;

extern crate tokio;

use std::{ sync::{ Mutex, Arc } };

use base64::{ engine::general_purpose, Engine };

use rsa::{ pkcs8::EncodePublicKey };
use tauri::{ State };
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
    // Generate a new RSA key pair
    //TODO ("move to gateway_handler");
    let mut rng = rand::thread_rng();
    use rsa::{ RsaPrivateKey, RsaPublicKey };
    let bits = 2048;
    let private_key = RsaPrivateKey::new(&mut rng, bits).expect("failed to generate a key");
    let public_key = RsaPublicKey::from(&private_key);

    let der = public_key.to_public_key_der().unwrap();
    let public_key_base64 = general_purpose::STANDARD.encode(der.as_bytes());

    println!("Public key: {:?}", public_key_base64);

    state.sender
        .lock()
        .unwrap()
        .blocking_send(
            OwnedMessage::Text(
                serde_json
                    ::to_string(
                        &(discord::gateway::init_packet::InitPacket {
                            op: "init".to_string(),
                            encoded_public_key: public_key_base64.clone(),
                        })
                    )
                    .unwrap()
            )
        )
        .unwrap();

    format!("{public_key_base64} ")
}
struct test {
    sender: Mutex<mpsc::Sender<OwnedMessage>>,
}

fn main() {
    use websocket::client::r#async::Client;
    println!("Starting");

    let gate = Arc::new(DiscordGateway::new());

    let (async_proc_input_tx, async_proc_input_rx) = mpsc::channel(1);
    let (async_proc_output_tx, mut async_proc_output_rx) = mpsc::channel::<String>(1);

    let t = test { sender: Mutex::new(async_proc_input_tx) };

    tauri::Builder
        ::default()
        .manage(t)
        .setup(|app| {
            //

            tauri::async_runtime::spawn(async move {
                gate.connect(async_proc_input_rx, async_proc_output_tx).await;
            });
            Ok(())
        })

        .invoke_handler(tauri::generate_handler![greet, test])

        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}