use std::sync::Arc;

use tokio::net::TcpStream;
use tokio_tungstenite::{ WebSocketStream, MaybeTlsStream };

pub struct ConnectionData {
	signature: Option<u64>,
}

pub struct Gateway {
	stop_notifyer: Option<Arc<tokio::sync::Notify>>,
}
impl Gateway {
	pub fn new() -> Arc<Self> {
		Arc::new(Self {
			stop_notifyer: None,
		})
	}

	async fn connect(
		&self
	) -> Result<WebSocketStream<MaybeTlsStream<TcpStream>>, tokio_tungstenite::tungstenite::Error> {
		todo!("connect to gateway")
	}
}
