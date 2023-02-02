#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod commands;
mod discord;
mod main_app_state;
mod manager;
mod modules;
mod webview_packets;
mod token_utils;

extern crate tokio;

use std::sync::{ Arc, Mutex };

use modules::login::{ Login, LoginResponse };
use serde::{ Serialize, Deserialize };
use tauri::{ State };
use tokio::sync::mpsc;
use webview_packets::Auth;

use crate::{ main_app_state::MainState, manager::ThreadManager };

// TODO: Move this to cammands.rs
#[tauri::command]
fn get_qrcode(state: State<Arc<MainState>>) -> Option<String> {
	println!("GtF");
	match &*state.state.lock().unwrap() {
		crate::main_app_state::State::LoginScreen { qr_url, .. } => {
			if !qr_url.is_empty() {
				return Some(qr_url.clone());
			}
			state.send(manager::Messages::Start {
				what: manager::Modules::MobileAuth,
			});
		}
		_ => {}
	}
	None
}

// TODO: Move this to cammands.rs
#[tauri::command]
fn get_token(id: String, state: State<Arc<MainState>>) -> Option<String> {
	state.tokens.lock().unwrap().get(&id).cloned()
}

#[tauri::command]
async fn login(
	captcha_token: Option<String>,
	login: String,
	password: String,
	state: State<'_, Arc<MainState>>
) -> Result<webview_packets::Auth, ()> {
	let mut captcha_token = captcha_token;
	{
		let mut app_state = state.state.lock().unwrap();
		if !matches!(*app_state, main_app_state::State::LoginScreen { .. }) {
			return Err(());
		}
		if let Some(token) = captcha_token.clone() {
			match *app_state {
				main_app_state::State::LoginScreen { ref mut captcha_token, .. } => {
					if captcha_token.is_some() {
						println!("Captcha token is already set");
					}
					*captcha_token = Some(token);
				}
				_ => {}
			}
		} else {
			//set token to captcha_token from state
			captcha_token = match &*app_state {
				main_app_state::State::LoginScreen { captcha_token, .. } => captcha_token.clone(),
				_ => None,
			};
		}
	}
	let a = Login::new();
	let res = a.login(captcha_token, login, password).await;

	println!("res: {:?}", res);
	match res {
		LoginResponse::Success { token, user_id, user_settings } => {
			println!("id: {}", user_id);

			state.tokens.lock().unwrap().insert(user_id.clone(), token.clone());
			Ok(webview_packets::Auth::LoginSuccess {
				user_id: user_id,
				user_settings: user_settings,
			})
		}
		LoginResponse::RequireAuth { captcha_key, captcha_sitekey, captcha_service, sms, ticket } =>
			Ok(webview_packets::Auth::RequireAuth {
				captcha_key,
				captcha_sitekey,
				captcha_service,
				sms,
				ticket,
			}),

		LoginResponse::Error { code, errors, message } =>
			Ok(webview_packets::Auth::Error { code, errors, message }),
	}
}
#[derive(Serialize, Deserialize, Debug)]
struct a {
	a: String,
	b: String,
}

#[tauri::command]
async fn test(state: State<'_, Arc<Mutex<a>>>) -> Result<a, ()> {
	println!("test");

	return Ok(a { a: "a".to_string(), b: "b".to_string() });
}

fn main() {
	println!("Starting");

	let (input, rec) = mpsc::channel(32);
	let main_state = Arc::new(MainState::new(Mutex::new(input)));

	let mut thread_manager = ThreadManager::new(main_state.clone(), rec);

	let t = Arc::new(Mutex::new(a { a: "test".to_string(), b: "co".to_string() })); //TODO remove

	tauri::Builder
		::default()
		.manage(main_state)
		.manage(t)
		.setup(|app| {
			let app_handle = app.handle();

			tauri::async_runtime::spawn(async move {
				thread_manager.run(app_handle).await;
			});

			Ok(())
		})
		.invoke_handler(tauri::generate_handler![get_qrcode, get_token, login, test])
		.run(tauri::generate_context!())
		.expect("Error while running tauri application.");
}