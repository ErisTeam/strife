use std::{ sync::{ Mutex, Arc } };

use websocket::{ OwnedMessage };

use crate::discord::{ gateway::gateway_packet::GatewayPacket, self };

pub struct DiscordGateway {
    url: Mutex<String>,

    pub timeout_ms: Arc<Mutex<u64>>,
    pub heartbeat_interval: Arc<Mutex<u64>>,

    pub connected: Mutex<bool>,
}
impl DiscordGateway {
    pub fn new() -> Self {
        Self {
            url: Mutex::new("".to_string()),
            //client: Arc::new(Mutex::new(client_future)),
            timeout_ms: Arc::new(Mutex::new(0)),
            heartbeat_interval: Arc::new(Mutex::new(0)),
            connected: Mutex::new(false),
        }
    }

    pub async fn connect(
        &self,
        reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,
        sender: tokio::sync::mpsc::Sender<String>
    ) {
        println!("Connecting");
        use websocket::ClientBuilder;

        *self.connected.lock().unwrap() = true;

        let mut headers = websocket::header::Headers::new();
        headers.set(websocket::header::Origin("https://discord.com".to_string()));
        let mut client = ClientBuilder::new("wss://remote-auth-gateway.discord.gg/?v=2")
            .unwrap()
            .custom_headers(&headers)
            .connect_secure(None)
            .unwrap();
        client.set_nonblocking(true).unwrap();

        let mut instant = std::time::Instant::now();

        let mut ack_recived = false;

        let mut reciver = reciver;

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
                    OwnedMessage::Text(text) => {
                        println!("Text: {}", text);
                        let s = serde_json::from_str::<GatewayPacket>(&text).unwrap();
                        match s.op.as_str() {
                            "hello" => {
                                let s = serde_json
                                    ::from_str::<discord::gateway::hello_packet::HelloPacket>(&text)
                                    .unwrap();
                                *self.timeout_ms.lock().unwrap() = s.timeout_ms;
                                *self.heartbeat_interval.lock().unwrap() = s.heartbeat_interval;
                                println!("{} {} {}", s.op, s.heartbeat_interval, s.timeout_ms);
                            }
                            "heartbeat_ack" => {
                                println!("{}", s.op);
                            }
                            _ => {
                                println!("{}", s.op);
                            }
                        }
                        println!("Text: {}", text);
                    }
                    // OwnedMessage::Close(reason) => {
                    //     println!("Close");
                    //     break;
                    // }
                    m => {
                        println!("Not text {:?}", m);
                    }
                }
            }

            if instant.elapsed().as_millis() > (*self.heartbeat_interval.lock().unwrap() as u128) {
                instant = std::time::Instant::now();
                let heartbeat = GatewayPacket {
                    op: "heartbeat".to_string(),
                };
                let heartbeat = serde_json::to_string(&heartbeat).unwrap();
                let heartbeat = OwnedMessage::Text(heartbeat);
                client.send_message(&heartbeat).unwrap();
                println!("Heartbeat");
            }
        }
    }
}