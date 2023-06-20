use std::sync::{ Arc, Mutex };

use serde::Deserialize;
use tauri::{ async_runtime::TokioHandle, Event, EventHandler, Manager };
use tokio::task::block_in_place;

use crate::{ main_app_state::{ self, MainState }, modules::auth::{ Auth, MFAResponse }, token_utils, webview_packets };

fn start_gateway(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) -> () {
	move |_event| {
		let id = state.last_id.lock().unwrap().as_ref().unwrap().clone();
		let result = state.start_gateway(handle.clone(), id);
		if let Err(result) = result {
			handle.emit_all("gateway", webview_packets::Gateway::Error { message: result }).unwrap();
		}
	}
}

fn start_mobile_gateway(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) -> () {
	move |_event| {
		let _ = state.start_mobile_auth(handle.clone());
	}
}

fn request_qrcode(
	state: Arc<Mutex<crate::main_app_state::StateOld>>,
	handle: tauri::AppHandle
) -> impl Fn(Event) -> () {
	move |_| {
		if let main_app_state::StateOld::LoginScreen { qr_url, .. } = &*state.lock().unwrap() {
			handle
				.emit_all("auth", webview_packets::Auth::MobileQrcode {
					qrcode: qr_url.clone(),
				})
				.unwrap();
			println!("emitted qrcode");
		}
	}
}

fn send_sms(state: Arc<Mutex<crate::main_app_state::StateOld>>, handle: tauri::AppHandle) -> impl Fn(Event) -> () {
	//TODO: clean up and add comments

	move |_event: Event| {
		let ticket;
		let use_sms;
		{
			let app_state = state.lock().unwrap();
			if let main_app_state::StateOld::LoginScreen { use_mfa: u, ticket: t, .. } = &*app_state {
				ticket = t.clone();
				use_sms = *u;
			} else {
				println!("How? gami to furras");
				return;
			}
		}
		if ticket.is_none() {
			println!("Ticket is not set");
			handle
				.emit_all("gateway", webview_packets::MFA::SmsSendingResult {
					success: false,
					message: "Ticket is not set".to_string(),
				})
				.unwrap();
			return;
		}
		if use_sms {
			let ticket = ticket.clone().unwrap();
			//TODO: make it work
			let _ = block_in_place(move || {
				TokioHandle::current().block_on(async move { Auth::send_sms(ticket).await });
			});
			todo!("return response to webview");
		} else {
			handle
				.emit_all("gateway", webview_packets::MFA::SmsSendingResult {
					success: false,
					message: "Not using sms".to_string(),
				})
				.unwrap();
		}
	}
}

#[derive(Debug, Deserialize)]
struct VerifyLoginPayload {
	code: String,
}
fn verify_login(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) -> () {
	move |event| {
		let c: VerifyLoginPayload = serde_json::from_str(event.payload().unwrap()).unwrap();

		let ticket;
		let use_mfa = true;//does this check if ueses sms?
		{
			let app_state = state.state.lock().unwrap();
			//LoginScreen(Arc<Auth>),
			if let main_app_state::State::LoginScreen(u) = &*app_state {
				ticket = u.ticket.try_read().unwrap().clone();
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
		//TODO: repair
		if !use_mfa && true == false {
			let res = block_in_place(move || {
				TokioHandle::current().block_on(async move { Auth::verify_sms(ticket, c.code).await })
			});
			let res = res.unwrap(); //TODO: handle error

			if let MFAResponse::Success { token, user_settings } = res {
				let user_id = token_utils::get_id(&token);

				state.add_new_user(user_id.clone(), token.clone());

				handle
					.emit_all("auth", webview_packets::MFA::VerifySuccess {
						user_id: user_id,
						user_settings: user_settings,
					})
					.unwrap();
			}

			//TODO:!("return response to webview");
		} else {
			let res = block_in_place(move || {
				TokioHandle::current().block_on(async move { Auth::verify_totp(ticket, c.code).await })
			});
			if res.is_err() {
				handle
					.emit_all("auth", webview_packets::MFA::VerifyError {
						message: "unknown error".to_string(),
					})
					.unwrap();
			}
			let res = res.unwrap();
			match res {
				MFAResponse::Success {
					token,
					//user_id,
					user_settings,
				} => {
					let user_id = token_utils::get_id(&token);

					state.add_new_user(user_id.clone(), token.clone());

					handle
						.emit_all("auth", webview_packets::MFA::VerifySuccess {
							user_id: user_id,
							user_settings: user_settings,
						})
						.unwrap();
				}
				MFAResponse::Error { message, .. } => {
					handle.emit_all("auth", webview_packets::MFA::VerifyError { message }).unwrap();
				}
			}
		}
	}
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LoginPayload {
	login: String,
	password: String,
	captcha_token: Option<String>,
}
fn login(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) -> () {
	move |event| {
		let payload: LoginPayload = serde_json::from_str(event.payload().unwrap()).unwrap(); //TODO: handle error

		let mut state = state.state.lock().unwrap();

		let auth = state.login().unwrap();

		let res = block_in_place(move || {
			TokioHandle::current().block_on(async move {
				auth.login(payload.captcha_token, payload.login, payload.password).await
			})
		});
		let payload = res.unwrap_or(webview_packets::Auth::Error {
			code: 0,
			errors: crate::discord::http_packets::auth::ErrorTypes {
				login: None,
				password: None,
				email: None,
			},
			message: "unknown error".to_string(),
		});
		handle.emit_all("auth", payload).unwrap();
	}
}

#[derive(Debug, Deserialize)]
struct MobileAuthLoginPayload {
	captcha_token: String,
}
#[allow(unused_variables)]
fn login_mobile_auth(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) -> () {
	move |event| {
		let payload: MobileAuthLoginPayload = serde_json::from_str(event.payload().unwrap()).unwrap();
		let state = &*state.state_old.lock().unwrap();
		if let main_app_state::StateOld::LoginScreen { captcha_rqtoken, captcha_sitekey: captcha_key, .. } = state {
			//TODO: make it work
			todo!()
			// let res = block_in_place(move || {
			// 	TokioHandle::current().block_on(async move {
			// 		let captcha_key = captcha_key.as_ref().unwrap().clone();
			// 		let captcha_rqtoken = captcha_rqtoken.as_ref().unwrap().clone();
			// 		Auth::login_mobile_auth(payload.captcha_token.clone(), captcha_key, captcha_rqtoken).await
			// 	})
			// });
		}
	}
}

pub fn get_all_events(state: Arc<main_app_state::MainState>, handle: tauri::AppHandle) -> Vec<EventHandler> {
	let h = handle.clone();
	vec![
		h.listen_global("requestQrcode", request_qrcode(state.state_old.clone(), handle.clone())),
		h.listen_global("sendSms", send_sms(state.state_old.clone(), handle.clone())),
		h.listen_global("verifyLogin", verify_login(state.clone(), handle.clone())),
		h.listen_global("login", login(state.clone(), handle.clone())),
		h.listen_global("startGateway", start_gateway(state.clone(), handle.clone())), // TODO: remove
		h.listen_global("startMobileGateway", start_mobile_gateway(state.clone(), handle.clone())),
		h.listen_global("loginMobileAuth", login_mobile_auth(state.clone(), handle.clone()))
	]
}
