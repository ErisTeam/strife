use std::{ time::Instant, net::TcpStream };

use serde::Serialize;
use websocket::{ native_tls::TlsStream, sync::Client, OwnedMessage };

use super::gateway::ConnectionInfo;

pub fn send_heartbeat<T: Serialize>(
	connection_info: &mut ConnectionInfo,
	client: &mut Client<TlsStream<TcpStream>>,
	data: Option<T>
) -> Option<bool> {
	let authed = connection_info.authed;
	let since_last_hearbeat = &mut connection_info.since_last_hearbeat;
	let heartbeat_interval = connection_info.heartbeat_interval;
	let ack_recived = &mut connection_info.ack_recived;
	if authed && since_last_hearbeat.elapsed().as_millis() > (heartbeat_interval as u128) {
		if !*ack_recived {
			return Some(false);
		}
		*ack_recived = false;
		*since_last_hearbeat = std::time::Instant::now();
		if let Some(data) = data {
			let heartbeat = OwnedMessage::Text(serde_json::to_string(&data).unwrap());
			client.send_message(&heartbeat).unwrap();
			println!("Heartbeat");
		}
	}
	None
}