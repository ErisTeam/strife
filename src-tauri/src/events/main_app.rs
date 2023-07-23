use std::{ fmt::Debug, sync::Arc };

use log::{ error, info, warn };
use serde::Deserialize;
use tauri::{ Event, EventHandler, Manager, async_runtime::TokioHandle };
use tokio::task::block_in_place;

use crate::{
	discord::types::relationship::Relationship,
	main_app_state::{ self, MainState },
	webview_packets::General,
};

//TODO: make all main_app events commands

#[derive(Debug, Deserialize)]
struct GetUserData {
	user_id: String,
}
#[deprecated]
fn get_user_data(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) {
	move |event| {
		let user_id = serde_json::from_str::<GetUserData>(event.payload().unwrap()).unwrap().user_id;

		let state = state.clone();
		let payload = block_in_place(move || {
			TokioHandle::current().block_on(async move {
				let state = state.state.read().await;

				let main_app = state.main_app().unwrap();

				let users = main_app.users.read().await;

				let mut res = General::Error {
					_for: "getUserData".to_string(),
					message: "No user data".to_string(),
				};
				if let Some(crate::modules::main_app::ActivationState::Activated(data)) = users.get(&user_id) {
					if let Some(user_data) = data.read_user_data().await.as_ref() {
						res = General::UserData {
							user: Box::new(user_data.user.clone()),
							users: user_data.users.clone(),
						};
					}
				}
				res
			})
		});

		handle.emit_all("general", payload).unwrap();
	}
}

fn get_relationships(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) {
	move |event| {
		let user_id = serde_json::from_str::<GetUserData>(event.payload().unwrap()).unwrap().user_id;

		let state = state.clone();
		let payload = block_in_place(move || {
			TokioHandle::current().block_on(async move {
				let state = state.state.read().await;

				let main_app = state.main_app().unwrap();

				let users = main_app.users.read().await;

				let mut res = General::Error {
					_for: "getRelationships".to_string(),
					message: "No user data".to_string(),
				};
				if let Some(crate::modules::main_app::ActivationState::Activated(data)) = users.get(&user_id) {
					if let Some(user_data) = data.read_user_data().await.as_ref() {
						let mut relationships = Vec::new();
						for relationship in &user_data.relationships {
							let user = user_data.get_user(&relationship.user_id);
							if let Some(user) = user {
								relationships.push(
									Relationship::from_gateway_relationship(relationship.clone(), user.clone())
								);
							} else {
								warn!("User with {:?} id not Found!", relationship.user_id);
							}
						}

						res = General::Relationships {
							relationships,
						};
					}
				}
				res
			})
		});

		handle.emit_all("general", payload).unwrap();
	}
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GetGuilds {
	user_id: String,
}
impl EventTrait<General> for GetGuilds {
	fn execute(&self, state: Arc<MainState>, _handle: tauri::AppHandle) -> Option<(&str, General)> {
		println!("get guilds");
		let res: Result<General, String> = block_in_place(move || {
			TokioHandle::current().block_on(async move {
				let app_state = state.state.read().await;
				let main_app = app_state.main_app().ok_or("No main app")?;

				let users = main_app.users.read().await;
				let user = users.get(&self.user_id).ok_or("No user data")?;
				if let crate::modules::main_app::ActivationState::Activated(user) = user {
					let userdata = user.read_user_data().await;
					let userdata = userdata.as_ref().ok_or("No user data")?;
					return Ok(General::Guilds {
						guilds: userdata.guilds.clone(),
					});
				}
				Err("No user data".to_string())
			})
		});
		if let Ok(res) = res {
			return Some(("general", res));
		} else {
			error!("Error getting guilds {:?}", res);
		}

		None
	}

	fn get_name() -> String {
		"getGuilds".to_string()
	}
}
//TODO: move or remove
trait EventTrait<T: serde::Serialize + Sized + Clone + Debug>: serde::de::DeserializeOwned {
	fn execute(&self, state: Arc<MainState>, handle: tauri::AppHandle) -> Option<(&str, T)>;

	fn get_name() -> String;

	fn register(state: &Arc<MainState>, handle: &tauri::AppHandle) -> EventHandler {
		info!("Registering event {}", Self::get_name());
		let h = handle.clone();
		let state = state.clone();
		handle.listen_global(Self::get_name(), move |event: Event| {
			info!("got event with payload {} {:?}", Self::get_name(), event.payload());
			let json: Self = serde_json::from_str(event.payload().unwrap()).unwrap();
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
		handle.listen_global("getUserData", get_user_data(state.clone(), h.clone())),
		handle.listen_global("getRelationships", get_relationships(state.clone(), h.clone())),
		// GetUserData::register(&state, &handle),
		GetGuilds::register(&state, &handle)
	]
}
