#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod discord;
mod gateway_handler;

extern crate tokio;

use std::{ sync::{ Mutex, Arc }, net::TcpStream, thread::JoinHandle, time::Instant };

use base64::{ engine::general_purpose, Engine };
use ring::signature::KeyPair;
use tauri::http::Request;
use tokio::sync::mpsc;
use websocket::{
    r#async::{ client::ClientNew },
    stream::r#async::AsyncRead,
    native_tls::TlsStream,
    OwnedMessage,
    Message,
};

use crate::{ discord::gateway::gateway_packet::GatewayPacket, gateway_handler::DiscordGateway };

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str, state: tauri::State<Arc<DiscordGateway>>) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn test(login: &str, password: &str, state: tauri::State<Arc<DiscordGateway>>) -> String {
    //create spki public key
    use ring::signature::Ed25519KeyPair;
    use ring::signature::RsaKeyPair;
    use ring::rand::SystemRandom;
    let rng = SystemRandom::new();
    let pkcs8_bytes = Ed25519KeyPair::generate_pkcs8(&rng).unwrap();

    let key_pair = Ed25519KeyPair::from_pkcs8(pkcs8_bytes.as_ref()).unwrap();

    let public_key = key_pair.public_key();
    let public_key_bytes = public_key.as_ref();
    let public_key_base64 = general_purpose::STANDARD.encode(public_key_bytes);

    // state.client
    //     .lock()
    //     .unwrap()
    //     .send_message(
    //         &Message::text(
    //             serde_json
    //                 ::to_string(
    //                     &(discord::gateway::init_packet::InitPacket {
    //                         encoded_public_key: public_key_base64.clone(),
    //                     })
    //                 )
    //                 .unwrap()
    //         )
    //     )
    //     .unwrap();

    format!(
        "{public_key_base64} {} {} {}",
        state.heartbeat_interval.lock().unwrap(),
        state.timeout_ms.lock().unwrap(),
        state.connected.lock().unwrap()
    )
}

#[tokio::main]
async fn main() {
    let mut runtime = tokio::runtime::Runtime::new().unwrap();
    use websocket::client::r#async::Client;
    println!("Starting");
    // client_future.and_then(|(client, headers)| {
    //     let buff: Vec<u8> = Vec::new();
    //     let a = client.get_mut().poll_read(buff);
    // });
    let mut gate = Arc::new(DiscordGateway::new());
    //gate.run();
    //gate.clone().run();

    //let a =
    //DiscordGateway::connect(gate.clone()).await;
    //let (async_proc_input_tx, async_proc_input_rx) = mpsc::channel(1);
    //let (async_proc_output_tx, mut async_proc_output_rx) = mpsc::channel(1);

    tauri::Builder
        ::default()
        //.manage(gate)
        .setup(|app| {
            //

            tokio::spawn(async move { //a
                DiscordGateway::connect(gate.clone()).await });
            Ok(())
        })

        .invoke_handler(tauri::generate_handler![greet, test])

        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    //let _ = runtime.block_on(a);
}