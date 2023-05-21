use std::{fmt::Debug, sync::Arc};

use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use tauri::{Event, EventHandler, Manager};

use crate::{
    discord::types::relationship::Relationship,
    main_app_state::{self, MainState, User},
    webview_packets::General,
};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct StartGatewayPayload {
    user_id: String,
}
fn start_gateway(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) -> () {
    move |event| {
        println!("got start_gateway with payload {:?}", event.payload());
        let user_id = serde_json::from_str::<StartGatewayPayload>(event.payload().unwrap())
            .unwrap()
            .user_id;

        let _ = state.start_gateway(handle.clone(), user_id);
    }
}


fn get_user_data(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) -> () {
    move |event| {
        let user_id = serde_json::from_str::<StartGatewayPayload>(event.payload().unwrap())
            .unwrap()
            .user_id;
        let user_data = state.users.lock().unwrap();

        let data = user_data.get(&user_id);
        if let Some(data) = data {
            if let User::ActiveUser(data) = data {
                handle
                    .emit_all(
                        "general",
                        General::UserData {
                            user: data.user.clone(),
                            users: data.users.clone(),
                        },
                    )
                    .unwrap();
                return;
            }
        } else {
            println!("No user data for {}", user_id);
        }

        handle
            .emit_all(
                "general",
                General::Error {
                    _for: "getUserData".to_string(),
                    message: "No user data".to_string(),
                },
            )
            .unwrap();
    }
}

fn get_relationships(state: Arc<MainState>, handle: tauri::AppHandle) -> impl Fn(Event) -> () {
    move |event| {
        let user_id = serde_json::from_str::<StartGatewayPayload>(event.payload().unwrap())
            .unwrap()
            .user_id;
        let user_data = state.users.lock().unwrap();

        let data = user_data.get(&user_id);
        if let Some(data) = data {
            if let User::ActiveUser(data) = data {
                let mut relationships = Vec::new();
                for relationship in data.relationships.clone() {
                    let user = data.get_user(&relationship.user_id);
                    if let Some(user) = user {
                        relationships.push(Relationship::from_gateway_relationship(
                            relationship,
                            user.clone(),
                        ));
                    }
                }

                handle
                    .emit_all(
                        "general",
                        General::Relationships {
                            relationships: relationships,
                        },
                    )
                    .unwrap();
            }
        } else {
            println!("No user data for {}", user_id);
        }
        handle
            .emit_all(
                "general",
                General::Error {
                    _for: "getRelationships".to_string(),
                    message: "No user data".to_string(),
                },
            )
            .unwrap();
    }
}
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GetRelationships {
    user_id: String,
}
impl event<General> for GetRelationships {
    fn execute(&self, state: Arc<MainState>, _handle: tauri::AppHandle) -> Option<(&str, General)> {
        let user_data = state.users.lock().unwrap();

        let data = user_data.get(&self.user_id);
        if let Some(data) = data {
            if let User::ActiveUser(data) = data {
                let mut relationships = Vec::new();
                for relationship in data.relationships.clone() {
                    let user = data.get_user(&relationship.user_id);
                    if let Some(user) = user {
                        relationships.push(Relationship::from_gateway_relationship(
                            relationship,
                            user.clone(),
                        ));
                    }
                }

                return Some((
                    "general",
                    General::Relationships {
                        relationships: relationships,
                    },
                ));
            }
        } else {
            println!("No user data for {}", self.user_id);
        }
        None
    }

    fn get_name() -> String {
        "getRelationships".to_string()
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GetGuilds {
    user_id: String,
}
impl event<General> for GetGuilds {
    fn execute(&self, state: Arc<MainState>, _handle: tauri::AppHandle) -> Option<(&str, General)> {
        let user_data = state.users.lock().unwrap();

        let data = user_data.get(&self.user_id);
        if let Some(data) = data {
            debug!("checking if user is active");
            if let User::ActiveUser(data) = data {
                info!("Sending guilds");
                return Some((
                    "general",
                    General::Guilds {
                        guilds: data.guilds.clone(),
                    },
                ));
            }
        } else {
            error!("No user data for {}", self.user_id);
            //todo emit error
        }
        None
    }

    fn get_name() -> String {
        "getGuilds".to_string()
    }
}

trait event<T: serde::Serialize + Sized + Clone + Debug>: serde::de::DeserializeOwned {
    fn execute(&self, state: Arc<MainState>, handle: tauri::AppHandle) -> Option<(&str, T)>;

    fn get_name() -> String;

    fn register(state: &Arc<MainState>, handle: &tauri::AppHandle) -> EventHandler {
        info!("Registering event {}", Self::get_name());
        let h = handle.clone();
        let state = state.clone();
        handle.listen_global(Self::get_name(), move |event: Event| {
            info!(
                "got event with payload {} {:?}",
                Self::get_name(),
                event.payload(),
            );
            let json: Self = serde_json::from_str(&event.payload().unwrap()).unwrap();
            let res = json.execute(state.clone(), h.clone());
            if let Some((name, data)) = res {
                h.emit_all(name, data).unwrap();
            }
        })
    }
}

pub fn get_all_events(
    state: Arc<main_app_state::MainState>,
    handle: tauri::AppHandle,
) -> Vec<EventHandler> {
    let h = handle.clone();
    vec![
        handle.listen_global("startGateway", start_gateway(state.clone(), h.clone())),
        handle.listen_global("getUserData", get_user_data(state.clone(), h.clone())),
        handle.listen_global(
            "getRelationships",
            get_relationships(state.clone(), h.clone()),
        ),
        // GetUserData::register(&state, &handle),
        // GetRelationships::register(&state, &handle),
        GetGuilds::register(&state, &handle),
    ]
}
