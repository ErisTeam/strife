use std::collections::HashMap;
use std::sync::{ Arc, Weak };

use log::{ debug, error, warn };
use tauri::{ AppHandle, Manager };
use tokio::runtime::Handle;
use tokio::sync::RwLock;

use crate::discord::gateway_packets::DispatchedEvents;
use crate::discord::types::gateway::gateway_packets_data::{
	MessageEvent,
	VoiceServerUpdate,
	VoiceStateUpdate,
	TypingStart,
	LazyGuilds,
};
use crate::discord::user::UserData;
use crate::{ Result, webview_packets, token_utils };

use super::gateway::{ Gateway, Messages };
use super::voice_gateway::VoiceGateway;
#[derive(Debug)]
pub enum VoiceGatewayMessages {
	//TODO: add voice gateway messages
	Packet(String),
}

/// Messages send from gateway
#[derive(Debug)]
#[allow(unused)]
pub enum GatewayMessages {
	NewMessage(MessageEvent),
	EditedMessage(MessageEvent),
	DeletedMessage(),
	TypingStarted(Box<TypingStart>),
	Ready(UserData),
	VoiceServerUpdate(VoiceServerUpdate),
	VoiceStateUpdate(VoiceStateUpdate),
}
impl From<DispatchedEvents> for GatewayMessages {
	fn from(value: DispatchedEvents) -> Self {
		match value {
			DispatchedEvents::Ready(data) => Self::Ready(UserData::from(data)),
			DispatchedEvents::ReadySupplemental(_) => todo!(),
			DispatchedEvents::SessionReplace(_) => todo!(),
			DispatchedEvents::MessageCreate(data) => Self::NewMessage(data),
			DispatchedEvents::MessageUpdate(data) => Self::EditedMessage(data),
			DispatchedEvents::MessageDelete(_) => todo!(),
			DispatchedEvents::TypingStart(data) => Self::TypingStarted(data),
			DispatchedEvents::BurstCreditBalanceUpdate(_) => todo!(),
			DispatchedEvents::Unknown(_) => panic!("Unknown event!"),
			DispatchedEvents::VoiceServerUpdate(data) => Self::VoiceServerUpdate(data),
			DispatchedEvents::VoiceStateUpdate(data) => Self::VoiceStateUpdate(data),
		}
	}
}

#[derive(Debug)]
pub struct ActiveUser {
	userdata: Arc<RwLock<Option<UserData>>>,

	#[allow(dead_code)]
	token: String,

	pub gateway: Arc<RwLock<Gateway>>,
}
impl ActiveUser {
	pub fn new(token: String, gateway: Arc<RwLock<Gateway>>) -> Self {
		Self {
			userdata: Arc::new(RwLock::new(None)),
			gateway,
			token,
		}
	}
	pub async fn read_user_data(&self) -> tokio::sync::RwLockReadGuard<'_, Option<UserData>> {
		self.userdata.read().await
	}
}

#[derive(Debug)]
pub enum ActivationState {
	InProgress,
	Activated(Arc<ActiveUser>),
}
impl ActivationState {
	pub async fn stop(&self) {
		if let Self::Activated(user) = self {
			user.gateway.read().await.stop();
		}
	}
}
#[derive(Debug)]
pub struct MainApp {
	pub users: RwLock<HashMap<String, ActivationState>>,

	pub guilds_state: RwLock<HashMap<String, LazyGuilds>>,

	pub voice_gateway: Arc<RwLock<Option<VoiceGateway>>>,
}
impl MainApp {
	pub fn new() -> Self {
		Self {
			users: RwLock::new(HashMap::new()),
			voice_gateway: Arc::new(RwLock::new(None)),
			guilds_state: RwLock::new(HashMap::new()),
		}
	}

	pub async fn get_user(&self, user_id: &str) -> Option<Arc<ActiveUser>> {
		let users = self.users.read().await;
		if let Some(ActivationState::Activated(user)) = users.get(user_id) {
			return Some(user.clone());
		}
		None
	}

	pub async fn start_voice_gateway(
		&self,
		handle: AppHandle,
		user_id: String,
		guild_id: String,
		endpoint: String,
		session_id: String,
		voice_token: String
	) -> crate::Result<()> {
		let mut voice_gateway = VoiceGateway::new();
		let (sender, receiver) = tokio::sync::mpsc::channel::<VoiceGatewayMessages>(5);
		voice_gateway.start(endpoint, handle, sender, voice_token, guild_id, user_id, session_id).await?;
		let mut v = self.voice_gateway.write().await;
		*v = Some(voice_gateway);

		Ok(())
	}

	pub async fn activate_user(&self, handle: AppHandle, token: String) -> Result<Arc<tokio::sync::Notify>> {
		let user_id = token_utils::get_id(&token)?;

		let mut users = self.users.write().await;
		users.insert(user_id.clone(), ActivationState::InProgress);
		drop(users);

		let (gateway, message_receiver) = self.start_gateway(handle.clone(), token.clone()).await?;

		let stop = gateway.read().await.stop_notifyer.as_ref().unwrap().clone();

		println!("token: {}", token);

		let user = Arc::new(ActiveUser::new(token, gateway.clone()));

		let mut users = self.users.write().await;

		let user_data = Arc::downgrade(&user.userdata);
		let gateway = Arc::downgrade(&gateway);

		let ready_notifyer = Arc::new(tokio::sync::Notify::new());

		let weak_notifyer = Arc::downgrade(&ready_notifyer);

		println!("Starting message handler thread");

		tokio::spawn(async move {
			tokio::select! {
				_ = stop.notified() => {
					debug!("Stopping Message Handler Thread");
				},
				e = Self::message_handler_thread(message_receiver,handle, gateway,user_data,weak_notifyer) => {
					error!("Message handler thread error: {:?}", e);
				},
			}
		});

		if users.insert(user_id, ActivationState::Activated(user)).is_some() {
			warn!("User already existed");
		}
		Ok(ready_notifyer)
	}

	pub async fn send_to_gateway(&self, user_id: &str, message: Messages) -> Result<()> {
		let users = self.users.read().await;

		//TODO: make return result
		if let ActivationState::Activated(user) = users.get(user_id).unwrap() {
			user.gateway.write().await.send_message(message).await?;
		} else {
			return Err("User not activated".into());
		}
		Ok(())
	}

	async fn error_handler_thread(
		mut error_receiver: tokio::sync::broadcast::Receiver<String>,
		gateway: Weak<RwLock<Gateway>>
	) -> Result<()> {
		loop {
			let error = error_receiver.recv().await?;
			debug!("Gateway error: {}", error);
			if let Some(gateway) = gateway.upgrade() {
				let gateway = gateway.read().await;
				gateway.stop();
				//TODO send message to webview
			} else {
				error!("Gateway is no longer available");
				return Err("Gateway is no longer available".into());
			}
		}
	}

	#[allow(unused_variables)]
	async fn message_handler_thread(
		mut message_receiver: tokio::sync::mpsc::Receiver<GatewayMessages>,
		handle: AppHandle,
		gateway: Weak<RwLock<Gateway>>,
		user_data: Weak<RwLock<Option<UserData>>>,
		ready_notify: Weak<tokio::sync::Notify>
	) -> Result<()> {
		let mut user_id = String::new();
		while let Some(message) = message_receiver.recv().await {
			match message {
				GatewayMessages::NewMessage(data) => {
					//TODO: Show Notification

					handle.emit_all("gateway", webview_packets::GatewayEvent {
						event: webview_packets::Gateway::MessageCreate(data),
						user_id: user_id.clone(),
					})?;
				}
				GatewayMessages::EditedMessage(data) => {
					handle.emit_all("gateway", webview_packets::GatewayEvent {
						event: webview_packets::Gateway::MessageUpdate(data),
						user_id: user_id.clone(),
					})?;
				}
				GatewayMessages::DeletedMessage() => todo!("Deleted Message"),
				GatewayMessages::Ready(data) => {
					let user_data = user_data.upgrade().ok_or("User data is no longer available")?;
					user_id = data.user.id.clone();

					let global_name = if let Some(global_name) = &data.user.global_name {
						global_name.clone()
					} else {
						data.user.username.clone()
					};

					user_data.write().await.replace(data);
					if let Some(ready_notify) = ready_notify.upgrade() {
						ready_notify.notify_waiters();
					}
				}
				data => {
					handle.emit_all("gateway", webview_packets::GatewayEvent {
						event: webview_packets::Gateway::from(data),
						user_id: user_id.clone(),
					})?;
				}
			}
		}
		Err("Message receiver channel closed".into())
	}

	async fn start_gateway(
		&self,
		handle: AppHandle,
		token: String
	) -> Result<(Arc<RwLock<Gateway>>, tokio::sync::mpsc::Receiver<GatewayMessages>)> {
		let gateway = Gateway::new();

		let (sender, receiver) = tokio::sync::mpsc::channel::<GatewayMessages>(5);

		let mut gateway_w = gateway.write().await;

		let error_receiver = gateway_w.start(handle, sender, token).await?;

		{
			let stop = gateway_w.stop_notifyer.clone().unwrap();
			let gateway = Arc::downgrade(&gateway);
			tokio::spawn(async move {
				tokio::select! {
				_ = stop.notified() => {
					debug!("Stopping Error Handler Thread");
				},
				_ = Self::error_handler_thread(error_receiver, gateway.clone()) => {
					error!("Error handler thread closed");
				},

			}
			});
		}

		drop(gateway_w);

		Ok((gateway, receiver))
	}

	#[allow(dead_code)]
	pub fn stop_sync(&self) {
		tokio::task::block_in_place(move || {
			Handle::current().block_on(async move {
				self.stop().await;
			})
		});
	}
	pub async fn stop(&self) {
		let users = self.users.write().await;
		for (_, user) in users.iter() {
			user.stop().await;
		}
	}
}
