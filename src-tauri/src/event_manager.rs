use std::sync::{ Weak };

use serde::Deserialize;
use tauri::{ AppHandle, Manager };
use crate::{ events, main_app_state::MainState };

#[derive(Debug)]
pub struct EventManager {
	state: Option<Weak<MainState>>,
	event_listeners: Vec<tauri::EventHandler>,
}

impl EventManager {
	pub fn new() -> Self {
		Self {
			state: None,
			event_listeners: Vec::new(),
		}
	}
	pub fn set_state(&mut self, state: Weak<MainState>) {
		self.state = Some(state);
	}
	pub fn clear_listeners(&mut self, handle: AppHandle) {
		for handler in self.event_listeners.clone().into_iter() {
			handle.unlisten(handler);
		}
		self.event_listeners.clear();
	}
	#[allow(unused)]
	pub fn register_debug(&mut self, handle: AppHandle) {
		let state = self.state.clone();

		#[derive(Deserialize, Debug)]
		struct Message {
			user_id: String,
		}
		//todo test Reconnecting
	}

	pub fn register_for_login_screen(&mut self, handle: AppHandle) {
		let state = self.state.as_ref().unwrap().upgrade().unwrap().clone();

		self.event_listeners.extend(events::auth::get_all_events(state, handle.clone()));
	}
	pub fn register_for_main_app(&mut self, handle: AppHandle) {
		let state = self.state.as_ref().unwrap().upgrade().unwrap().clone();

		self.event_listeners.extend(events::main_app::get_all_events(state, handle.clone()));
	}
}
