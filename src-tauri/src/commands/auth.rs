use std::sync::Arc;
use tauri::State;

use crate::{ main_app_state::{ MainState } };
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