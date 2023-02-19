use std::sync::{ Mutex, Arc };

use serde::Deserialize;
use tauri::{ Manager, async_runtime::TokioHandle, Event, EventHandler };
use tokio::task::block_in_place;

use crate::{
	main_app_state::{ self, MainState },
	modules::auth::{ Auth, MFAResponse },
	webview_packets,
};

fn request_qrcode(
	state: Arc<Mutex<crate::main_app_state::State>>,
	handle: tauri::AppHandle
) -> impl Fn(Event) -> () {
	move |event| {
		println!("got qrcode event with payload {:?}", event.payload());
		if let main_app_state::State::LoginScreen { qr_url, .. } = &*state.lock().unwrap() {
			handle
				.emit_all("auth", webview_packets::MobileAuth::Qrcode {
					qrcode: qr_url.clone(),
				})
				.unwrap();
			println!("emitted qrcode");
		}
	}
}

fn send_sms(
	state: Arc<Mutex<crate::main_app_state::State>>,
	handle: tauri::AppHandle
) -> impl Fn(Event) -> () {
	move |_event: Event| {
		let ticket;
		let use_sms;
		{
			let app_state = state.lock().unwrap();
			if let main_app_state::State::LoginScreen { use_mfa: u, ticket: t, .. } = &*app_state {
				ticket = t.clone();
				use_sms = *u;
			} else {
				handle
					.emit_all("SmsSendingResult", webview_packets::MFA::SmsSendingResult {
						success: false,
						message: "Not in login screen".to_string(),
					})
					.unwrap();
				return;
			}
		}
		if ticket.is_none() {
			println!("Ticket is not set");
			todo!("return error to webview");
		}
		if use_sms {
			let ticket = ticket.clone().unwrap();
			let r = block_in_place(move || {
				TokioHandle::current().block_on(async move { Auth::send_sms(ticket).await });
			});
			todo!("return response to webview");
		} else {
			todo!("return error to webview");
		}
	}
}

//todo repair
#[derive(Debug, Deserialize)]
struct VerifyLoginPayload {
	code: String,
	is_sms: bool,
}
fn verify_login(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) -> () {
	move |event| {
		let c: VerifyLoginPayload = serde_json::from_str(event.payload().unwrap()).unwrap();

		let ticket;
		let use_sms;
		{
			let app_state = state.state.lock().unwrap();
			if let main_app_state::State::LoginScreen { use_mfa: u, ticket: t, .. } = &*app_state {
				ticket = t.clone();
				use_sms = *u;
			} else {
				handle
					.emit_all("auth", webview_packets::MFA::SmsSendingResult {
						success: false,
						message: "Not in login screen".to_string(),
					})
					.unwrap();
				return;
			}
		}

		if ticket.is_none() {
			println!("Ticket is not set");
			handle
				.emit_all("auth", webview_packets::MFA::SmsSendingResult {
					success: false,
					message: "Ticket is not set".to_string(),
				})
				.unwrap();
		}
		let ticket = ticket.clone().unwrap();
		if use_sms {
			let res = block_in_place(move || {
				TokioHandle::current().block_on(async move {
					Auth::verify_sms(ticket, c.code).await
				})
			});
			todo!("return response to webview");
		} else {
			let res = block_in_place(move || {
				TokioHandle::current().block_on(async move {
					Auth::verify_totp(ticket, c.code).await
				})
			});
			if res.is_err() {
				handle
					.emit_all("gateway", webview_packets::MFA::VerifyError {
						message: "unknown error".to_string(),
					})
					.unwrap();
			}
			let res = res.unwrap();
			match res {
				MFAResponse::Success { token, user_id, user_settings } => {
					state.add_token(token, user_id.clone());
					handle
						.emit_all("gateway", webview_packets::MFA::VerifySuccess {
							user_id: user_id,
							user_settings: user_settings,
						})
						.unwrap();
				}
				MFAResponse::Error { message, .. } => {
					handle
						.emit_all("gateway", webview_packets::MFA::VerifyError {
							message,
						})
						.unwrap();
				}
			}
		}
	}
}

#[derive(Debug, Deserialize)]
struct LoginPayload {
	login: String,
	password: String,
	captcha_token: Option<String>,
}
fn login(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) -> () {
	use crate::modules::auth::LoginResponse;

	move |event| {
		let c: LoginPayload = serde_json::from_str(event.payload().unwrap()).unwrap();
		let password = c.password;
		let login = c.login;
		let mut captcha_token = c.captcha_token;
		{
			let mut app_state = state.state.lock().unwrap();

			if !matches!(*app_state, main_app_state::State::LoginScreen { .. }) {
				//return Err(());
				todo!("return error to webview");
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
					main_app_state::State::LoginScreen { captcha_token, .. } =>
						captcha_token.clone(),
					_ => None,
				};
			}
		}
		let res = block_in_place(move || {
			TokioHandle::current().block_on(async move {
				Auth::login(captcha_token, login, password).await
			})
		});

		println!("res: {:?}", res);
		match res {
			LoginResponse::Success { token, user_id, user_settings } => {
				println!("id: {}", user_id);

				state.tokens.lock().unwrap().insert(user_id.clone(), token.clone());
				handle
					.emit_all("auth", webview_packets::Auth::LoginSuccess {
						user_id,
						user_settings: user_settings,
					})
					.unwrap()
			}
			LoginResponse::RequireAuth {
				captcha_key,
				captcha_sitekey,
				captcha_service,
				sms,
				ticket: new_ticket,
				mfa,
			} => {
				println!("ticket: {:?}", new_ticket);
				if new_ticket.is_some() {
					match *state.state.lock().unwrap() {
						main_app_state::State::LoginScreen {
							ref mut ticket,
							ref mut use_mfa,
							..
						} => {
							*ticket = new_ticket.clone();
							if mfa.is_some() {
								*use_mfa = true;
							}
						}
						_ => {}
					}
				}
				handle
					.emit_all("auth", webview_packets::Auth::RequireAuth {
						captcha_key,
						captcha_sitekey,
						captcha_service,
						sms,
						mfa,
					})
					.unwrap()
			}

			LoginResponse::Error { code, errors, message } =>
				handle
					.emit_all("auth", webview_packets::Auth::Error {
						code,
						errors,
						message,
					})
					.unwrap(),
		}
	}
}

pub fn get_all_events(
	state: Arc<main_app_state::MainState>,
	handle: tauri::AppHandle
) -> Vec<EventHandler> {
	let h = handle.clone();
	vec![
		h.listen_global("requestQrcode", request_qrcode(state.state.clone(), handle.clone())),
		h.listen_global("sendSms", send_sms(state.state.clone(), handle.clone())),
		h.listen_global("verifyLogin", verify_login(state.clone(), handle.clone())),
		h.listen_global("login", login(state.clone(), handle.clone()))
	]
}