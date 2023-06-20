use std::sync::{ Mutex, Weak };

use log::{ debug, error };
use serde::Deserialize;
use tauri::{ async_runtime::TokioHandle, AppHandle, Manager };
use tokio::task::block_in_place;

use crate::{ events, main_app_state::MainState };

#[derive(Debug)]
pub struct EventManager {
	state: Option<Weak<MainState>>,
	event_listeners: Mutex<Vec<tauri::EventHandler>>,
}

impl EventManager {
	pub fn new() -> Self {
		Self {
			state: None,
			event_listeners: Mutex::new(Vec::new()),
		}
	}
	pub fn set_state(&mut self, state: Weak<MainState>) {
		self.state = Some(state);
	}
	pub fn clear_listeners(&self, handle: AppHandle) {
		let mut event_listeners = self.event_listeners.lock().unwrap();

		for handler in event_listeners.clone().into_iter() {
			handle.unlisten(handler);
		}
		event_listeners.clear();
	}
	pub fn register_debug(&self, handle: AppHandle) {
		let mut event_listeners = self.event_listeners.lock().unwrap();

		let state = self.state.clone();

		#[derive(Deserialize, Debug)]
		struct Message {
			user_id: String,
		}
		//todo test Reconnecting
	}

	pub fn register_for_login_screen(&self, handle: AppHandle) {
		let mut event_listeners = self.event_listeners.lock().unwrap();
		let state = self.state.as_ref().unwrap().upgrade().unwrap().clone();

		event_listeners.extend(events::auth::get_all_events(state, handle.clone()));
	}
	pub fn register_for_main_app(&self, handle: AppHandle) {
		let mut event_listeners = self.event_listeners.lock().unwrap();
		let state = self.state.as_ref().unwrap().upgrade().unwrap().clone();

		event_listeners.extend(events::main_app::get_all_events(state, handle.clone()));
	}
}
