use std::sync::Arc;

use serde::Deserialize;
use tauri::{ async_runtime::TokioHandle, Event, EventHandler, Manager };
use tokio::task::block_in_place;

use crate::{
	main_app_state::{ self, MainState },
	modules::auth::VerificationMethod,
	webview_packets::{ self, auth::MFA },
};

fn send_sms(
	state: Arc<tokio::sync::RwLock<crate::main_app_state::State>>,
	_handle: tauri::AppHandle
) -> impl Fn(Event) {
	move |_event: Event| {
		let state = state.clone();
		let _ = block_in_place(move || {
			TokioHandle::current().block_on(async move {
				let state = state.read().await;

				let auth = state.login().unwrap();

				auth.send_sms().await
			})
		});
		todo!("return response to webview");
	}
}

#[derive(Debug, Deserialize)]
struct VerifyLoginPayload {
	code: String,
	method: VerificationMethod,
}
fn verify_login(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) {
	move |event| {
		let payload = serde_json::from_str::<VerifyLoginPayload>(event.payload().unwrap_or(""));
		if payload.is_err() {
			handle
				.emit_all("auth", webview_packets::auth::MFA::VerifyError { message: "invalid payload".to_string() })
				.unwrap();
			return;
		}
		let payload = payload.unwrap();

		let state = state.clone();
		let payload = block_in_place(move || {
			TokioHandle::current().block_on(async move {
				let state = state.state.read().await;

				let auth = state.login().unwrap();

				auth.verify_login(payload.code, payload.method).await
			})
		});
		if let Err(err) = payload {
			handle.emit_all("auth", webview_packets::auth::MFA::VerifyError { message: err.to_string() }).unwrap();
			return;
		}
		handle.emit_all("auth", MFA::from(payload.unwrap())).unwrap();
	}
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LoginPayload {
	login: String,
	password: String,
	captcha_token: Option<String>,
}
fn login(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) {
	move |event| {
		let payload: LoginPayload = serde_json::from_str(event.payload().unwrap()).unwrap(); //TODO: handle error

		let state = state.clone();
		let res = block_in_place(move || {
			TokioHandle::current().block_on(async move {
				let state = state.state.read().await;

				let auth = state.login().unwrap();

				auth.login(payload.captcha_token, payload.login, payload.password).await
			})
		});
		let payload = res.unwrap_or(webview_packets::auth::Auth::Error {
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
fn login_remote_auth(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) {
	move |event| {
		let payload: MobileAuthLoginPayload = serde_json::from_str(event.payload().unwrap()).unwrap();

		let state = state.clone();
		let res = block_in_place(move || {
			TokioHandle::current().block_on(async move {
				let state = state.state.read().await;

				let auth = state.login().unwrap();

				let captcha_data = auth.captcha_data.blocking_read();

				if captcha_data.is_none() {
					todo!("return error to webview");
				}
				let captcha_data = captcha_data.as_ref().unwrap();

				//TODO: check if works

				crate::modules::auth::Auth::login_remote_auth(
					payload.captcha_token.clone(),
					Some(captcha_data.captcha_token.clone()),
					Some(captcha_data.captcha_sitekey.clone())
				).await
			})
		});
	}
}

pub fn get_all_events(state: Arc<main_app_state::MainState>, handle: tauri::AppHandle) -> Vec<EventHandler> {
	let h = handle.clone();
	vec![
		h.listen_global("sendSms", send_sms(state.state.clone(), handle.clone())),
		h.listen_global("verifyLogin", verify_login(state.clone(), handle.clone())),
		h.listen_global("login", login(state.clone(), handle.clone())),
		h.listen_global("loginMobileAuth", login_remote_auth(state.clone(), handle.clone()))
	]
}
