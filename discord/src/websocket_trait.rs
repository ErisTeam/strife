use std::{ sync::Arc, time::Duration };

use crate::websocket_connection::WebsocketConnection;

pub trait WebsocketThreads<D> {
    fn get_heartbeat_packet(
        connection_data: &D
    ) -> anyhow::Result<tokio_tungstenite::tungstenite::Message>;

    async fn logic_thread(
        connection_data: Arc<tokio::sync::Mutex<D>>,
        websocket: Arc<WebsocketConnection>,
        start: tokio::sync::oneshot::Sender<u64>
    );
}

#[derive(Debug)]
pub struct ConnectionInfo<D, S> {
    pub ack_recived: bool,

    pub heartbeat_interval: Duration,

    pub timeout_ms: u64,

    // pub hearbeat_notify: Arc<tokio::sync::Notify>,

    pub stop: Arc<tokio::sync::Notify>,

    pub sender: tokio::sync::mpsc::Sender<S>,

    pub aditional_data: D,
}
impl<T, S> ConnectionInfo<T, S> {
    pub fn new(aditional_data: T, sender: tokio::sync::mpsc::Sender<S>) -> Self {
        Self {
            ack_recived: true,
            heartbeat_interval: Duration::ZERO,
            timeout_ms: 0,
            aditional_data,
            stop: Arc::new(tokio::sync::Notify::new()),
            sender,
        }
    }
    // pub fn start_heartbeat(&self) {
    // 	self.hearbeat_notify.notify_waiters();
    // }
}
