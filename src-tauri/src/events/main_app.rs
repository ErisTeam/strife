use std::{ sync::Arc, fmt::Debug };

use serde::{ Deserialize, Serialize };
use tauri::{ EventHandler, Event, Manager };

use crate::{ main_app_state::{ self, MainState, User }, discord::user, webview_packets::General };

#[derive(Debug, Deserialize)]
struct StartGatewayPayload {
	user_id: String,
}
fn start_gateway(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) -> () {
	move |event| {
		println!("got start_gateway with payload {:?}", event.payload());
		let user_id = serde_json::from_str::<StartGatewayPayload>(event.payload().unwrap()).unwrap().user_id;

		state.start_gateway(handle.clone(), user_id);
	}
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GetUserDataPayload {
	user_id: String,
}
pub fn get_user_data(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) -> () {
	move |event| {
		let data = serde_json::from_str::<GetUserDataPayload>(event.payload().unwrap()).unwrap();
		data.user_id;
		//...
		//handle.emit_all("userData", General::UserData {}).unwrap();
		//...
	}
}

#[derive(Debug, Deserialize)]
struct GetUserData {
	user_id: String,
}
impl event<General> for GetUserData {
	fn execute(&self, state: Arc<MainState>, handle: tauri::AppHandle) -> Option<(&str, General)> {
		let user_data = state.user_data.lock().unwrap();

		let data = user_data.get(&self.user_id);
		if let Some(data) = data {
			if let User::ActiveUser(data) = data {
				return Some(("general", General::UserData { guilds: data.guilds.clone() }));
			}
		} else {
			println!("No user data for {}", self.user_id);
		}
		None
	}

	fn get_name() -> String {
		"getUserData".to_string()
	}
}

trait event<T: serde::Serialize + Sized + Clone + Debug>: serde::de::DeserializeOwned {
	fn execute(&self, state: Arc<MainState>, handle: tauri::AppHandle) -> Option<(&str, T)>;

	fn get_name() -> String;

	fn register(state: &Arc<MainState>, handle: &tauri::AppHandle) -> EventHandler {
		println!("Registering event {}", Self::get_name());
		let h = handle.clone();
		let state = state.clone();
		handle.listen_global(Self::get_name(), move |event: Event| {
			let json: Self = serde_json::from_str(&event.payload().unwrap()).unwrap();
			let res = json.execute(state.clone(), h.clone());
			if let Some((name, data)) = res {
				h.emit_all(name, data).unwrap();
			}
		})
	}
}

pub fn get_all_events(state: Arc<main_app_state::MainState>, handle: tauri::AppHandle) -> Vec<EventHandler> {
	let h = handle.clone();
	vec![
		handle.listen_global("startGateway", start_gateway(state.clone(), h.clone())),
		GetUserData::register(&state, &handle)
	]
}