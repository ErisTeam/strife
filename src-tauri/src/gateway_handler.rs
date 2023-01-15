use std::{ sync::{ Mutex, Arc }, thread::JoinHandle };

// use websocket::{ native_tls::TlsStream, OwnedMessage, client::r#async };

use futures::StreamExt;
use tokio::{ runtime::Builder, io::AsyncWriteExt };
use websocket::{ r#async::{ client::TlsStream, TcpStream, Client }, OwnedMessage };

use crate::discord::{ gateway::gateway_packet::GatewayPacket, self };

pub struct DiscordGateway {
    url: Mutex<String>,
    // pub client: Arc<Mutex<websocket::sync::Client<TlsStream<TcpStream>>>>,
    handle: Option<JoinHandle<()>>,

    pub timeout_ms: Arc<Mutex<u64>>,
    pub heartbeat_interval: Arc<Mutex<u64>>,

    pub connected: Mutex<bool>,
}
impl DiscordGateway {
    pub fn new() -> Self {
        // let mut headers = websocket::header::Headers::new();
        // headers.set(websocket::header::Origin("https://discord.com".to_string()));

        // let client_future = websocket::ClientBuilder
        //     ::new("wss://remote-auth-gateway.discord.gg/?v=2")
        //     .unwrap()
        //     .custom_headers(&headers)
        //     .connect_secure(None)
        //     .unwrap();

        Self {
            url: Mutex::new("".to_string()),
            //client: Arc::new(Mutex::new(client_future)),
            handle: None,
            timeout_ms: Arc::new(Mutex::new(0)),
            heartbeat_interval: Arc::new(Mutex::new(0)),
            connected: Mutex::new(false),
        }
    }
    pub async fn connect(self: Arc<Self>) {
        println!("Connecting");
        use websocket::ClientBuilder;
        use websocket::r#async::client::{ Client, ClientNew };
        use websocket::r#async::TcpStream;
        use websocket::futures::{ Future, Stream, Sink };
        use websocket::Message;
        use tokio::runtime::Builder;

        //let mut runtime = tokio::runtime::Builder::new_current_thread().build().unwrap();

        *self.connected.lock().unwrap() = true;

        //connect to websocket using websocket crate and read  use async
        let headers = websocket::header::Headers::new();
        let mut client = ClientBuilder::new("wss://gateway.discord.gg/?v=8&encoding=json")
            .unwrap()
            .custom_headers(&headers)
            .connect_secure(None)
            .unwrap();
        client.set_nonblocking(true).unwrap();
        loop {
            //try recieve message a
            let message = client.recv_message().unwrap();
            match message {
                OwnedMessage::Text(text) => {
                    let t = text.clone();
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
                        _ => {
                            println!("{}", s.op);
                        }
                    }
                    println!("Text: {}", text);
                }
                _ => {
                    println!("Not text");
                }
            }
        }
    }
    // pub fn run(&self) {
    //     println!("Starting thread");
    //     let client = self.client.clone();
    //     let timeout = self.timeout_ms.clone();
    //     let heartbeat_interval = self.heartbeat_interval.clone();
    //     let mut instant = std::time::Instant::now();
    //     //let a = std::thread::spawn(move || {
    //     println!("Thread started");
    //     loop {
    //         let c = client.lock().unwrap().recv_message().unwrap();

    //         match c {
    //             OwnedMessage::Text(text) => {
    //                 let t = text.clone();
    //                 let s = serde_json::from_str::<GatewayPacket>(&text).unwrap();
    //                 match s.op.as_str() {
    //                     "hello" => {
    //                         let s = serde_json
    //                             ::from_str::<discord::gateway::hello_packet::HelloPacket>(&text)
    //                             .unwrap();
    //                         *timeout.lock().unwrap() = s.timeout_ms;
    //                         *heartbeat_interval.lock().unwrap() = s.heartbeat_interval;
    //                         println!("{} {} {}", s.op, s.heartbeat_interval, s.timeout_ms);
    //                     }
    //                     _ => {
    //                         println!("{}", s.op);
    //                     }
    //                 }
    //                 println!("Text: {}", text);
    //             }
    //             _ => {
    //                 println!("Not text");
    //             }
    //         }
    //         if instant.elapsed().as_millis() > (*heartbeat_interval.lock().unwrap() as u128) {
    //             instant = std::time::Instant::now();
    //             let mut client = client.lock().unwrap();
    //             //client.send_message(&Message::text("{\"op\": 1, \"d\": null}")).unwrap();
    //         }
    //     }

    //     ()
    //     //});
    // }
}