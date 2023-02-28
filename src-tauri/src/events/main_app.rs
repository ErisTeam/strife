use std::sync::Arc;

use serde::Deserialize;
use tauri::{ EventHandler, Event, Manager };

use crate::main_app_state::{ self, MainState };

#[derive(Debug, Deserialize)]
struct StartGatewayPayload {
	user_id: String,
}
fn start_gateway(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) -> () {
	move |event| {
		println!("got event-name with payload {:?}", event.payload());
		let user_id = serde_json
			::from_str::<StartGatewayPayload>(event.payload().unwrap())
			.unwrap().user_id;

		state.start_gateway(handle.clone(), user_id);
	}
}

pub fn get_all_events(
	state: Arc<main_app_state::MainState>,
	handle: tauri::AppHandle
) -> Vec<EventHandler> {
	let h = handle.clone();
	vec![handle.listen_global("startGateway", start_gateway(state.clone(), h.clone()))]
}