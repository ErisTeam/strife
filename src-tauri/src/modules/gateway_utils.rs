use std::time::{Duration, Instant};

use futures_util::SinkExt;
use log::{debug, warn};
use serde::Serialize;
use tokio_tungstenite::{
    tungstenite::{Error, Message},
    WebSocketStream,
};

pub async fn send_heartbeat<T: Serialize>(
    connection_info: &mut ConnectionInfo,
    write: &mut futures_util::stream::SplitSink<
        WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
        tokio_tungstenite::tungstenite::Message,
    >,
    data: Option<T>,
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
pub struct ConnectionInfo {
    pub authed: bool,
    pub ack_recived: bool,

    pub since_last_hearbeat: Instant,

    pub heartbeat_interval: Duration,

    pub timeout_ms: u64,
}
impl Default for ConnectionInfo {
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
impl ConnectionInfo {
    pub fn reset(&mut self) {
        self.authed = false;
        self.ack_recived = true;
        self.since_last_hearbeat = Instant::now();
    }
    pub fn reset_since_last_hearbeat(&mut self) {
        self.since_last_hearbeat = Instant::now();
    }
}
