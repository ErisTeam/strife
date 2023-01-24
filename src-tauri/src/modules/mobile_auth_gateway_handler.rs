use std::{ sync::{ Mutex, Arc }, net::TcpStream };

use base64::{ engine::{ general_purpose }, Engine };
use rsa::{ RsaPublicKey, RsaPrivateKey, pkcs8::EncodePublicKey, PaddingScheme };
use websocket::{ OwnedMessage, sync::Client, native_tls::TlsStream };

use crate::{
	discord::{ self, gateway_packets::{ self, MobileAuthGatewayPackets }, http_packets::Auth },
	webview_packets,
	main_app_state::{ MainState, State },
	modules::gateway_trait::send_heartbeat,
};

/// # Information
/// Handles the QR code authentication, as well as sending <br>
/// the heartbeats.
/// 
/// # More Information
/// 
/// To start the authentication we generate a public key and <br>
/// send it to discord. We should receive encrypted data, <br>
/// decrypt it and send it back to ensure that the key is working.
/// 
/// After that, when the user scans the QE code, we are going <br>
/// to receive encrypted user data which contains:
///     - `user ID` (snowflake)
///     - `user discriminator` (int)
///     - `user avatar hash` (hex)
///     - `username` (string) <br>
/// 
/// On the users app there should appear a prompt to accept or <br>
/// decline the logging in attempt. When the user accepts we <br>
/// are going to receive a ticket.
/// 
/// For more information on how all of this functions you <br>
/// should visit the [Unofficial Discord API](https://luna.gitlab.io/discord-unofficial-docs/desktop_remote_auth_v2.html).
pub struct MobileAuthHandler {
	pub timeout_ms: Arc<Mutex<u64>>,
	pub heartbeat_interval: Arc<Mutex<u64>>,

	pub connected: Mutex<bool>,

	pub public_key: Option<RsaPublicKey>,
	private_key: Option<RsaPrivateKey>,

	app_state: Arc<MainState>,
}
impl MobileAuthHandler {
    pub fn new(app_state: Arc<MainState>) -> Self {
        Self {
            timeout_ms: Arc::new(Mutex::new(0)),
            heartbeat_interval: Arc::new(Mutex::new(0)),
            connected: Mutex::new(false),
            app_state,
            public_key: None,
            private_key: None,
        }
    }

    /// # Information
    /// Decrypts the provided key
    fn decrypt(&self, bytes: Vec<u8>) -> Vec<u8> {
        let padding = PaddingScheme::new_oaep::<sha2::Sha256>();
        self.private_key.as_ref().unwrap().decrypt(padding, &bytes).unwrap()
    }

    /// # Information
    /// Generates a public and private key.
    pub fn generate_keys(&mut self) {
        let mut rng = rand::thread_rng();
		println!("Generating keys...");
		println!("Generating keys...");

        let bits = 2048;

        let private_key = RsaPrivateKey::new(&mut rng, bits).expect("failed to generate a key");
        let public_key = RsaPublicKey::from(&private_key);

        self.public_key = Some(public_key);
        self.private_key = Some(private_key);
    }

    /// # Information
    /// Sends the public key in base64 to discord
    fn send_init(&self, client: &mut Client<TlsStream<TcpStream>>) {
        // Convert the public key to base64
        let public_key_base64 = general_purpose::STANDARD.encode(
            &self.public_key.as_ref().unwrap().to_public_key_der().unwrap()
        );

        // Send the public key to discord
        let public_key_json = serde_json::to_string(
            &(discord::gateway_packets::MobileAuthGatewayPackets::Init {
                encoded_public_key: public_key_base64.clone(),
            })
        )
        .unwrap();

        println!("{}", public_key_json);

        client.send_message(&OwnedMessage::Text(public_key_json)).unwrap();
    }

    /// # Information
    /// Sends the decrypted and hashed `nonce_proof` back to discord.
    fn send_proof(&self, client: &mut Client<TlsStream<TcpStream>>, encrypted_nonce: String) {
        // Decrypt the nonce
        let bytes = general_purpose::STANDARD.decode(encrypted_nonce.as_bytes()).unwrap();
        let data = self.decrypt(bytes);

        // Hash the nonce
        use sha2::Digest;
        println!("data {:?}", general_purpose::STANDARD.encode(&data));

        let mut hasher = sha2::Sha256::new();
        hasher.update(data);
        let result = hasher.finalize();
        let base64 = general_purpose::URL_SAFE_NO_PAD.encode(&result);

        println!("{:?}", base64);

        // Send the proof
        let nonce_json = serde_json::to_string(
            &(discord::gateway_packets::MobileAuthGatewayPackets::NonceProofClient {
                proof: base64.clone(),
            })
        )
        .unwrap();

        client.send_message(&OwnedMessage::Text(nonce_json)).unwrap();

        println!("Sent proof");
    }

    /// # Information
    /// Set the `timeout_ms`, `heartbeat_interval` and use the `send_init` function.
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

    /// # Information
    /// Makes a connection with discord.
    fn conn(&self) -> Client<TlsStream<TcpStream>> {
        // Create a header
        use websocket::ClientBuilder;
        let mut headers = websocket::header::Headers::new();
        headers.set(websocket::header::Origin("https://discord.com".to_string()));

        // Connect to discord
        let client = ClientBuilder::new("wss://remote-auth-gateway.discord.gg/?v=2")
            .unwrap()
            .custom_headers(&headers)
            .connect_secure(None)
            .unwrap();

        client.set_nonblocking(true).unwrap();

        client
    }

    /// # Information
    /// Gets the token from discord.
    async fn get_token(&self, ticket: String) -> Result<String, String> {
        let client = reqwest::Client::new();
        let ticket_json = serde_json::to_string(
            &(discord::http_packets::Auth::Login {
                ticket: ticket
            })
        )
        .unwrap();
        
        let res = client
            .post("https://discord.com/api/v9/users/@me/remote-auth/login")
            .header("Content-Type", "application/json")
            .body(ticket_json)
            .send()
            .await
            .unwrap();

		let json = res.json::<discord::http_packets::Auth>().await.unwrap();
		match json {
			discord::http_packets::Auth::LoginResponse { encrypted_token } => {
				let bytes = general_purpose::STANDARD.decode(encrypted_token.as_bytes()).unwrap();
				let token = String::from_utf8(self.decrypt(bytes)).unwrap();
				Ok(token)
			}
			Auth::Error { code, errors, message } => {
				println!("{} {} {}", code, errors, message);
				Err(message)
			}
			_ => {
				println!("Unknown");
				Err("Unknown".to_string())
			}
		}
	}

    /// # Information
    /// Runs the mobile auth.
    pub async fn run(
        &self,
        reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,
        sender: tokio::sync::mpsc::Sender<webview_packets::MobileAuth>
    ) {
        let mut reciver = reciver;
        let mut sender = sender;

        while !self.connect(&mut reciver, &mut sender).await {
            println!("Reconnecting");
        }
		println!("shutting down mobile auth")
	}

	async fn handle_message(&self, message: OwnedMessage) {
		todo!("move to this function")
	}

    /// # Information
    /// TODO
    pub async fn connect(
        &self,
        reciver: &mut tokio::sync::mpsc::Receiver<OwnedMessage>,
        sender: &mut tokio::sync::mpsc::Sender<webview_packets::MobileAuth>
    ) -> bool {
        println!("Connecting...");

		*self.connected.lock().unwrap() = true;

        let mut client = self.conn();
        let mut instant = std::time::Instant::now();
        let mut ack_recived = true;
        let mut started = false;
        let mut user_id = None;

        // TODO: Clean this up ;3 (I'm lazy) (Also Gami is a furry)
        loop {
            if let Ok(reciver_message) = reciver.try_recv() {
                client.send_message(&reciver_message).unwrap();
            }

            if let Ok(client_message) = client.recv_message() {
                match client_message {
                    OwnedMessage::Text(text) => {
                        println!("Text: {}", text);
                        match
                            serde_json
                                ::from_str::<gateway_packets::MobileAuthGatewayPackets>(&text)
                                .unwrap()
                        {
                            MobileAuthGatewayPackets::HeartbeatAck {} => {
                                ack_recived = true;
                            }
                            MobileAuthGatewayPackets::Hello { heartbeat_interval, timeout_ms } => {
                                started = true;
                                self.handle_hello(&mut client, heartbeat_interval, timeout_ms);
                            }
                            MobileAuthGatewayPackets::NonceProofServer { encrypted_nonce } =>
                                self.send_proof(&mut client, encrypted_nonce),
                            MobileAuthGatewayPackets::PendingRemoteInit { fingerprint } => {
                                println!("Fingerprint: {}", fingerprint);
                                let qr_url = format!("https://discordapp.com/ra/{}", fingerprint);
                                sender
                                    .send(webview_packets::MobileAuth::Qrcode {
                                        qrcode: qr_url.clone(),
                                    }).await
                                    .unwrap();
                                let mut state = self.app_state.state.lock().unwrap();
                                if matches!(&*state, State::LoginScreen { .. }) {
                                    *state = State::LoginScreen { qr_url: qr_url.clone() };
                                }
                            }
                            MobileAuthGatewayPackets::PendingTicket { encrypted_user_payload } => {
                                println!("Ticket: {}", encrypted_user_payload);
                                let decrypted = general_purpose::STANDARD
                                    .decode(encrypted_user_payload.as_bytes())
                                    .unwrap();
                                let decrypted = self.decrypt(decrypted);
                                //split decrypted :
                                let string = String::from_utf8(decrypted).unwrap();
                                let splited = string.split(':').collect::<Vec<&str>>();
                                println!("{:?}", string);
                                user_id = Some(splited[0].to_string());
                                sender
                                    .send(webview_packets::MobileAuth::TicketData {
                                        user_id: splited[0].to_string(),
                                        discriminator: splited[1].to_string(),
                                        avatar_hash: splited[2].to_string(),
                                        username: splited[3].to_string(),
                                    }).await
                                    .unwrap();
                            }
                            MobileAuthGatewayPackets::PendingLogin { ticket } => {
                                client.shutdown().unwrap();
                                match self.get_token(ticket).await {
                                    Ok(token) => {
                                        if user_id.is_some() {
                                            self.app_state.tokens
                                                .lock()
                                                .unwrap()
                                                .insert(user_id.unwrap(), token);
                                            sender
                                                .send(
                                                    webview_packets::MobileAuth::LoginSuccess {}
                                                ).await
                                                .unwrap();
                                        }
                                    }
                                    Err(message) => {
                                        sender
                                            .send(webview_packets::MobileAuth::LoginError {
                                                error: message,
                                            }).await
                                            .unwrap();
                                    }
                                }
                                return true;
                            }
                            _ => {}
                        }
                    }
                    OwnedMessage::Close(reason) => {
                        println!("Close {:?}", reason);
                        return false;
                    }
                    m => {
                        println!("Not text {:?}", m);
                    }
                }
            }

            send_heartbeat(
                &mut instant,
                started,
                *self.heartbeat_interval.lock().unwrap(),
                &mut ack_recived,
                &mut client,
                &(|| {
                    Some(serde_json::to_string(&(MobileAuthGatewayPackets::Heartbeat {})).unwrap())
                })
            );
            //tokio thread sleep
            tokio::time::sleep(std::time::Duration::from_millis(10)).await;
        }
    }
}