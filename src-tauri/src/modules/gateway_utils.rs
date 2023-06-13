use std::{ time::{ Duration, Instant }, sync::Arc };

use futures_util::{ SinkExt, stream::{ SplitStream, SplitSink }, StreamExt };
use log::{ debug, warn };
use serde::Serialize;
use tauri::AppHandle;
use tokio_tungstenite::{ tungstenite::{ Error, Message }, WebSocketStream, connect_async_tls_with_config };

use async_trait::async_trait;

pub async fn send_heartbeat<T: Serialize>(
	connection_info: &mut ConnectionInfo_old,
	write: &mut futures_util::stream::SplitSink<
		WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
		tokio_tungstenite::tungstenite::Message
	>,
	data: Option<T>
) -> Result<bool, Error> {
	let authed = connection_info.authed;
	let heartbeat_interval = connection_info.heartbeat_interval;
	let since_last_hearbeat = &mut connection_info.since_last_hearbeat;
	let ack_recived = &mut connection_info.ack_recived;

	//println!("{} {} {}", authed, since_last_hearbeat.elapsed().as_millis(), heartbeat_interval);
	if authed && since_last_hearbeat.elapsed() > heartbeat_interval {
		if !*ack_recived {
			warn!("not ack_recived");
			return Ok(false);
		}
		*ack_recived = false;
		connection_info.reset_since_last_hearbeat();
		if let Some(data) = data {
			let heartbeat = Message::Text(serde_json::to_string(&data).unwrap());
			write.send(heartbeat).await?;
			debug!("Heartbeat sent");
		}
	}
	Ok(true)
}
#[derive(Debug)]
pub struct ConnectionInfo_old {
	pub authed: bool,
	pub ack_recived: bool,

	pub since_last_hearbeat: Instant,

	pub heartbeat_interval: Duration,

	pub timeout_ms: u64,
}
impl Default for ConnectionInfo_old {
	fn default() -> Self {
		Self {
			authed: false,
			ack_recived: true,
			since_last_hearbeat: Instant::now(),
			heartbeat_interval: Duration::ZERO,
			timeout_ms: 0,
		}
	}
}
impl ConnectionInfo_old {
	pub fn reset(&mut self) {
		self.authed = false;
		self.ack_recived = true;
		self.since_last_hearbeat = Instant::now();
	}
	pub fn reset_since_last_hearbeat(&mut self) {
		self.since_last_hearbeat = Instant::now();
	}
}

#[derive(Debug)]
pub struct ConnectionInfo<T> {
	pub authed: bool,
	pub ack_recived: bool,

	pub heartbeat_interval: Duration,

	pub timeout_ms: u64,

	pub start_hearbeat: Arc<tokio::sync::Notify>,

	pub stop: tokio::sync::broadcast::Sender<()>,

	pub handle: tauri::AppHandle,

	pub aditional_data: T,
}
impl<T> ConnectionInfo<T> {
	pub fn new(aditional_data: T, stop: tokio::sync::broadcast::Sender<()>, app_handle: AppHandle) -> Self {
		Self {
			authed: false,
			ack_recived: true,
			heartbeat_interval: Duration::ZERO,
			timeout_ms: 0,
			start_hearbeat: Arc::new(tokio::sync::Notify::new()),
			aditional_data,
			stop,
			handle: app_handle,
		}
	}
}
#[async_trait]
trait Gateway<T> where T: Send + Sync {
	//TODO: implemnent
}
