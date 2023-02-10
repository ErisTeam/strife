use std::sync::Arc;
use tauri::State;

use crate::{
	main_app_state::{ MainState, self },
	webview_packets,
	modules::auth::{ Auth, LoginResponse, MFAResponse },
};
#[tauri::command]
pub fn start_mobile_auth(state: State<Arc<MainState>>, handle: tauri::AppHandle) -> Option<String> {
	println!("GtF");
	state.start_mobile_auth(handle);
	None
	// match &*state.state.lock().unwrap() {
	// 	crate::main_app_state::State::LoginScreen { qr_url, .. } => {
	// 		if !qr_url.is_empty() {
	// 			return Some(qr_url.clone());
	// 		}

	// 		// state.send(manager::Messages::Start {
	// 		// 	what: manager::Modules::MobileAuth,
	// 		// });
	// 	}
	// 	_ => {}
	// }
	// None
}
//todo switch to events
#[tauri::command]
pub async fn send_sms(state: State<'_, Arc<MainState>>) -> Result<webview_packets::MFA, ()> {
	let ticket;
	let use_sms;
	{
		let app_state = state.state.lock().unwrap();
		if let main_app_state::State::LoginScreen { use_mfa: u, ticket: t, .. } = &*app_state {
			ticket = t.clone();
			use_sms = *u;
		} else {
			return Ok(webview_packets::MFA::SmsSendingResult {
				success: false,
				message: "Not in login screen".to_string(),
			});
		}
	}
	if ticket.is_none() {
		println!("Ticket is not set");
		todo!("return error to webview");
	}
	if use_sms {
		let ticket = ticket.clone().unwrap();
		Auth::send_sms(ticket).await;
		todo!("return response to webview");
	} else {
		todo!("return error to webview");
	}
}
#[tauri::command]
pub async fn verify_login(
	code: String,
	is_sms: bool,
	state: State<'_, Arc<MainState>>
) -> Result<webview_packets::MFA, ()> {
	let ticket;
	let use_sms;
	{
		let app_state = state.state.lock().unwrap();
		if let main_app_state::State::LoginScreen { use_mfa: u, ticket: t, .. } = &*app_state {
			ticket = t.clone();
			use_sms = *u;
		} else {
			return Ok(webview_packets::MFA::SmsSendingResult {
				success: false,
				message: "Not in login screen".to_string(),
			});
		}
	}

	if ticket.is_none() {
		println!("Ticket is not set");
		return Ok(webview_packets::MFA::SmsSendingResult {
			success: false,
			message: "Ticket is not set".to_string(),
		});
	}
	let ticket = ticket.clone().unwrap();
	if use_sms {
		let res = Auth::verify_sms(ticket, code).await;
		todo!("return response to webview");
	} else {
		let res = Auth::verify_totp(ticket, code).await;
		if res.is_err() {
			return Ok(webview_packets::MFA::VerifyError {
				message: "unknown error".to_string(),
			});
		}
		let res = res.unwrap();
		match res {
			MFAResponse::Success { token, user_id, user_settings } => {
				state.add_token(token, user_id.clone());
				return Ok(webview_packets::MFA::VerifySuccess {
					user_id: user_id,
					user_settings: user_settings,
				});
			}
			MFAResponse::Error { message, .. } => {
				return Ok(webview_packets::MFA::VerifyError {
					message,
				});
			}
		}
	}
}

#[tauri::command]
pub async fn login(
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

	let res = Auth::login(captcha_token, login, password).await;

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
					main_app_state::State::LoginScreen { ref mut ticket, ref mut use_mfa, .. } => {
						*ticket = new_ticket.clone();
						if mfa.is_some() {
							*use_mfa = true;
						}
					}
					_ => {}
				}
			}
			Ok(webview_packets::Auth::RequireAuth {
				captcha_key,
				captcha_sitekey,
				captcha_service,
				sms,
				mfa,
			})
		}

		LoginResponse::Error { code, errors, message } =>
			Ok(webview_packets::Auth::Error {
				code,
				errors,
				message,
			}),
	}
}