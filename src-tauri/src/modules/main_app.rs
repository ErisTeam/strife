use std::sync::{ Arc, RwLock };

use log::debug;
use tauri::AppHandle;
use websocket::OwnedMessage;

use crate::main_app_state::{ MainState };
use crate::Result;

#[derive(Debug)]
pub struct MainApp {
	#[deprecated]
	sender: RwLock<Option<tokio::sync::mpsc::Sender<OwnedMessage>>>,
}
impl MainApp {
	pub fn new() -> Arc<Self> {
		Arc::new(Self {
			sender: RwLock::new(None),
		})
	}

	#[deprecated]
	pub fn start_gateway(
		&self,
		state: Arc<MainState>,
		handle: AppHandle,
		token: String,
		user_id: String
	) -> Result<()> {
		let (sender, receiver) = tokio::sync::mpsc::channel::<OwnedMessage>(10);
		let mut gateway = super::gateway_old::Gateway::new(state, handle, receiver, token, user_id);

		tauri::async_runtime::spawn(async move {
			gateway.run().await;
		});

		self.sender.write().unwrap().replace(sender);

		Ok(())
	}
	pub fn stop(&self) {
		debug!("Stopping Gateway");
		let mut sender = self.sender.write().unwrap();
		if let Some(sender) = sender.take() {
			tokio::task::block_in_place(move || {
				tokio::runtime::Handle::current().block_on(async move {
					let _ = sender.send(OwnedMessage::Close(None)).await;
				})
			})
		}
	}
}
