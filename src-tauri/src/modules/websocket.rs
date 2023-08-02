use std::sync::Arc;

use futures_util::{ stream::{ SplitSink, SplitStream }, StreamExt, SinkExt };
use tokio::sync::{ Mutex, RwLock };
use tokio_tungstenite::WebSocketStream;

use crate::Result;
type Reader = SplitStream<WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>>;
type Writer = SplitSink<
	WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
	tokio_tungstenite::tungstenite::Message
>;

pub struct WebSocket {
	reader: Arc<Mutex<Reader>>,
	writer: Arc<Mutex<Writer>>,
}
impl WebSocket {
	async fn create_connection(url: String) -> Result<(Writer, Reader)> {
		let (ws_stream, _) = tokio_tungstenite::connect_async(url).await?;
		Ok(ws_stream.split())
	}

	//Change to accept tungstenite ClientHttpRequest
	pub async fn new(url: String) -> Result<Self> {
		let (writer, reader) = Self::create_connection(url).await?;
		Ok(Self {
			reader: Arc::new(Mutex::new(reader)),
			writer: Arc::new(Mutex::new(writer)),
		})
	}

	pub async fn reader(&self) -> Arc<Mutex<Reader>> {
		return self.reader.clone();
	}

	pub async fn send(&self, msg: tokio_tungstenite::tungstenite::Message) -> Result<()> {
		let mut writer = self.writer.lock().await;
		writer.send(msg).await?;
		Ok(())
	}

	pub async fn reconnect(&self, url: String) -> Result<()> {
		let mut reader = self.reader.lock().await;
		let mut writer = self.writer.lock().await;
		let (new_writer, new_reader) = Self::create_connection(url).await?;
		*reader = new_reader;
		*writer = new_writer;
		Ok(())
	}
}
