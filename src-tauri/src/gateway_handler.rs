use std::{ sync::{ Mutex, Arc }, net::TcpStream };

use base64::{ engine::{ general_purpose }, Engine };
use rsa::{ RsaPublicKey, RsaPrivateKey, pkcs8::EncodePublicKey, PaddingScheme };
use websocket::{ OwnedMessage, sync::Client, native_tls::TlsStream };

use crate::discord::{ gateway::{ gateway_packet::{ GatewayPacket } }, self };

pub struct DiscordGateway {
    url: Mutex<String>,

    pub timeout_ms: Arc<Mutex<u64>>,
    pub heartbeat_interval: Arc<Mutex<u64>>,

    pub connected: Mutex<bool>,

    pub public_key: Option<RsaPublicKey>,
    private_key: Option<RsaPrivateKey>,
}
impl DiscordGateway {
    pub fn new() -> Self {
        Self {
            url: Mutex::new("".to_string()),
            timeout_ms: Arc::new(Mutex::new(0)),
            heartbeat_interval: Arc::new(Mutex::new(0)),
            connected: Mutex::new(false),
            public_key: None,
            private_key: None,
        }
    }
    pub fn generate_keys(&mut self) {
        let mut rng = rand::thread_rng();

        let bits = 2048;
        let private_key = RsaPrivateKey::new(&mut rng, bits).expect("failed to generate a key");
        let public_key = RsaPublicKey::from(&private_key);
        self.public_key = Some(public_key);
        self.private_key = Some(private_key);
    }

    fn send_init(&self, client: &mut Client<TlsStream<TcpStream>>) {
        let public_key_base64 = general_purpose::STANDARD.encode(
            &self.public_key.as_ref().unwrap().to_public_key_der().unwrap()
        );
        let t = serde_json
            ::to_string(
                &(discord::gateway::gateway_packet::GatewayPacket::Init {
                    encoded_public_key: public_key_base64.clone(),
                })
            )
            .unwrap();
        println!("{}", t);
        client
            .send_message(
                &OwnedMessage::Text(
                    serde_json
                        ::to_string(
                            &(discord::gateway::gateway_packet::GatewayPacket::Init {
                                encoded_public_key: public_key_base64.clone(),
                            })
                        )
                        .unwrap()
                )
            )
            .unwrap();
    }
    fn decrypt(&self, bytes: Vec<u8>) -> Vec<u8> {
        let padding = PaddingScheme::new_oaep::<sha2::Sha256>();
        self.private_key.as_ref().unwrap().decrypt(padding, &bytes).unwrap()
    }
    fn send_proof(&self, client: &mut Client<TlsStream<TcpStream>>, data: Vec<u8>) {
        use sha2::Digest;
        println!("data {:?}", general_purpose::STANDARD.encode(&data));
        let mut hasher = sha2::Sha256::new();
        hasher.update(data);
        let result = hasher.finalize();
        let base64 = general_purpose::URL_SAFE_NO_PAD.encode(&result);

        println!("{:?}", base64);
        client
            .send_message(
                &OwnedMessage::Text(
                    serde_json
                        ::to_string(
                            &(discord::gateway::gateway_packet::GatewayPacket::NonceProofClient {
                                proof: base64.clone(),
                            })
                        )
                        .unwrap()
                )
            )
            .unwrap();
        println!("Sent proof");
    }

    fn handle_hello(
        &self,
        client: &mut Client<TlsStream<TcpStream>>,
        heartbeat_interval: u64,
        timeout_ms: u64
    ) {
        *self.timeout_ms.lock().unwrap() = timeout_ms;
        *self.heartbeat_interval.lock().unwrap() = heartbeat_interval;
        println!("hello {} {}", heartbeat_interval, timeout_ms);
        self.send_init(client);
    }

    fn handle_once_proof(
        &self,
        client: &mut Client<TlsStream<TcpStream>>,
        encrypted_nonce: String
    ) {
        let bytes = general_purpose::STANDARD.decode(encrypted_nonce.as_bytes()).unwrap();

        let data = self.decrypt(bytes);

        self.send_proof(client, data);
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

        let mut ack_recived = true;

        let mut started = false;

        let mut reciver = reciver;

        let mut status = true;

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
                        match serde_json::from_str::<GatewayPacket>(&text).unwrap() {
                            GatewayPacket::HeartbeatAck {} => {
                                ack_recived = true;
                            }
                            GatewayPacket::Hello { heartbeat_interval, timeout_ms } => {
                                started = true;
                                self.handle_hello(&mut client, heartbeat_interval, timeout_ms);
                            }
                            GatewayPacket::NonceProofServer { encrypted_nonce } =>
                                self.handle_once_proof(&mut client, encrypted_nonce),
                            GatewayPacket::PendingRemoteInit { fingerprint } => {
                                sender.send(fingerprint).await.unwrap();
                            }
                            GatewayPacket::PendingRemoteInit { fingerprint } => {
                                sender.send(fingerprint).await.unwrap();
                            }
                            _ => {}
                        }
                    }
                    OwnedMessage::Close(reason) => {
                        println!("Close {:?}", reason);
                        todo!("reconnect"); //todo reconnect
                        break;
                    }
                    m => {
                        println!("Not text {:?}", m);
                    }
                }
            }

            if
                started &&
                instant.elapsed().as_millis() > (*self.heartbeat_interval.lock().unwrap() as u128)
            {
                if !ack_recived {
                    todo!("reconnect"); //todo reconnect
                }
                ack_recived = false;
                instant = std::time::Instant::now();
                let heartbeat = serde_json::to_string(&(GatewayPacket::Heartbeat {})).unwrap();
                let heartbeat = OwnedMessage::Text(heartbeat);
                client.send_message(&heartbeat).unwrap();
                println!("Heartbeat");
            }
        }
        //todo return status;
    }
}