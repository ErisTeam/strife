use std::sync::{ Arc, Mutex };

use serde::Deserialize;
use tauri::{ AppHandle, Manager };

use crate::{ main_app_state::{ MainState }, events };

#[derive(Debug)]
pub struct EventManager {
	state: Arc<MainState>,
	event_listeners: Mutex<Vec<tauri::EventHandler>>,
}

impl EventManager {
	pub fn new(state: Arc<MainState>) -> Self {
		Self { state, event_listeners: Mutex::new(Vec::new()) }
	}
	pub fn clear_listeners(&self, handle: AppHandle) {
		let mut event_listeners = self.event_listeners.lock().unwrap();

		for handler in event_listeners.clone().into_iter() {
			handle.unlisten(handler);
		}
		event_listeners.clear();
	}

	pub fn register_for_login_screen(&self, handle: AppHandle) {
		let mut event_listeners = self.event_listeners.lock().unwrap();

		event_listeners.extend(events::auth::get_all_events(self.state.clone(), handle.clone()));
	}
	pub fn register_for_main_app(&self, handle: AppHandle) {
		let mut event_listeners = self.event_listeners.lock().unwrap();
		event_listeners.extend(
			events::main_app::get_all_events(self.state.clone(), handle.clone())
		);
	}
}