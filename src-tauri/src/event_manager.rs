use std::sync::{ Arc, Mutex };

use tauri::{ AppHandle, Manager };

use crate::{ main_app_state::MainState, webview_packets };
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
		let h = handle.clone();
		let h = handle.listen_global("requestQrcode", move |event| {
			println!("got event-name with payload {:?}", event.payload());
			h.emit_all("mobileAuth", webview_packets::MobileAuth::Qrcode {
				qrcode: "".to_string(),
			}).unwrap();
			println!("emitted qrcode");
		});
		event_listeners.push(h);
	}
}