use std::{ sync::Arc, net::TcpStream };

use websocket::{ OwnedMessage, sync::Client, native_tls::TlsStream };

use crate::{ main_app_state::MainState, webview_packets, discord::gateway_packets::GatewayPackets };

pub struct Gateway {
    pub timeout_ms: Arc<u64>,
    pub heartbeat_interval: Arc<u64>,
    pub state: Arc<MainState>,
}
impl Gateway {
    pub fn new(state: Arc<MainState>) -> Self {
        Self { state, timeout_ms: Arc::new(0), heartbeat_interval: Arc::new(0) }
    }
    fn conn(&self) -> Client<TlsStream<TcpStream>> {
        use websocket::ClientBuilder;
        let mut headers = websocket::header::Headers::new();
        headers.set(websocket::header::Origin("https://discord.com".to_string()));
        let client = ClientBuilder::new("wss://remote-auth-gateway.discord.gg/?v=2")
            .unwrap()
            .custom_headers(&headers)
            .connect_secure(None)
            .unwrap();
        client.set_nonblocking(true).unwrap();
        client
    }
    pub async fn run(
        &self,
        reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,
        sender: tokio::sync::mpsc::Sender<webview_packets::gateway>
    ) {
        let mut reciver = reciver;
        let mut sender = sender;
        while !self.connect(&mut reciver, &mut sender).await {
            print!("Reconnecting");
        }
        println!("shutting down mobile auth")
    }
    pub async fn connect(
        &self,
        reciver: &mut tokio::sync::mpsc::Receiver<OwnedMessage>,
        sender: &mut tokio::sync::mpsc::Sender<webview_packets::gateway>
    ) -> bool {
        println!("Connecting");

        let mut client = self.conn();

        let mut instant = std::time::Instant::now();

        let mut ack_recived = true;

        let mut started = false;

        let mut last_s: Option<u64> = None;

        //let mut user_id = None;

        loop {
            let message = client.recv_message();

            let m = reciver.try_recv();
            if m.is_ok() {
                let m = m.unwrap();
                client.send_message(&m).unwrap();
            }

            if message.is_ok() {
                let message = message.unwrap();
                match message {
                    OwnedMessage::Text(text) => {}
                    OwnedMessage::Close(reason) => {
                        println!("Close {:?}", reason);
                        return false;
                    }
                    m => {
                        println!("Not text {:?}", m);
                    }
                }
            }
            if started && instant.elapsed().as_millis() > (*self.heartbeat_interval as u128) {
                if !ack_recived {
                    return false;
                }
                ack_recived = false;
                instant = std::time::Instant::now();
                let heartbeat;
                if last_s.is_none() {
                    heartbeat = serde_json::to_string(&(GatewayPackets::HeartbeatNull {})).unwrap();
                } else {
                    heartbeat = serde_json
                        ::to_string(&(GatewayPackets::Heartbeat { d: last_s.unwrap() }))
                        .unwrap();
                }

                let heartbeat = OwnedMessage::Text(heartbeat);
                client.send_message(&heartbeat).unwrap();
                println!("Heartbeat");
            }
            //tokio thread sleep
            tokio::time::sleep(std::time::Duration::from_millis(10)).await;
        }
    }
}