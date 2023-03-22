use std::{
    net::TcpStream,
    sync::{Arc, Mutex},
    time::Duration,
};

use base64::{engine::general_purpose, Engine};
use rsa::{pkcs8::EncodePublicKey, PaddingScheme, RsaPrivateKey, RsaPublicKey};
use tauri::{AppHandle, Manager};
use websocket::{native_tls::TlsStream, sync::Client, OwnedMessage, WebSocketError};

use crate::{
    discord::{
        constants,
        http_packets::{self, Auth},
        mobile_auth_packets::{self, MobileAuthGatewayPackets},
    },
    main_app_state::{MainState, State},
    modules::gateway_utils::send_heartbeat_websocket,
    webview_packets,
};

use super::gateway_utils::ConnectionInfo;

enum GetTokenResponse {
    Other(String),
    RequireAuth {
        captcha_key: Option<Vec<String>>,
        captcha_sitekey: Option<String>,
        captcha_service: Option<String>,
        captcha_rqdata: Option<String>,
        captcha_rqtoken: Option<String>,
    },
}

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
///     - `user discriminator` (string)
///     - `user avatar hash` (string)
///     - `username` (string) <br>
///
/// On the users app there should appear a prompt to accept or <br>
/// decline the logging in attempt. When the user accepts we <br>
/// are going to receive a ticket.
///
/// For more information on how all of this functions you <br>
/// should visit the [Unofficial Discord API](https://luna.gitlab.io/discord-unofficial-docs/desktop_remote_auth_v2.html).
#[derive(Debug)]
pub struct MobileAuthHandler {
    timeout_ms: u64,

    pub connected: Mutex<bool>,

    pub public_key: Option<RsaPublicKey>,
    private_key: Option<RsaPrivateKey>,

    app_state: Arc<MainState>,

    handle: AppHandle,

    reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,

    connection_info: ConnectionInfo,
}
impl MobileAuthHandler {
    pub fn new(
        app_state: Arc<MainState>,
        handle: AppHandle,
        reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,
    ) -> Self {
        Self {
            timeout_ms: 0,
            connected: Mutex::new(false),
            app_state,
            public_key: None,
            private_key: None,
            handle,
            reciver,
            connection_info: ConnectionInfo::default(),
        }
    }
    fn decrypt(&self, bytes: Vec<u8>) -> Vec<u8> {
        let padding = PaddingScheme::new_oaep::<sha2::Sha256>();
        self.private_key
            .as_ref()
            .unwrap()
            .decrypt(padding, &bytes)
            .unwrap()
    }
    pub fn generate_keys(&mut self) {
        println!("Generating keys...");
        let mut rng = rand::thread_rng();

        let bits = 2048;
        let private_key = RsaPrivateKey::new(&mut rng, bits).expect("failed to generate a key");
        let public_key = RsaPublicKey::from(&private_key);
        self.public_key = Some(public_key);
        self.private_key = Some(private_key);
        println!("Keys generated");
    }

    fn emit_event(&self, event: webview_packets::Auth) -> Result<(), tauri::Error> {
        println!("emiting {:?}", event.clone());
        self.handle.emit_all("auth", event)?;

        Ok(())
    }

    fn send_init(&self, client: &mut Client<TlsStream<TcpStream>>) {
        let public_key_base64 = general_purpose::STANDARD.encode(
            &self
                .public_key
                .as_ref()
                .unwrap()
                .to_public_key_der()
                .unwrap(),
        );
        let t = serde_json::to_string(
            &(mobile_auth_packets::MobileAuthGatewayPackets::Init {
                encoded_public_key: public_key_base64.clone(),
            }),
        )
        .unwrap();
        println!("{}", t);
        client
            .send_message(&OwnedMessage::Text(
                serde_json::to_string(
                    &(mobile_auth_packets::MobileAuthGatewayPackets::Init {
                        encoded_public_key: public_key_base64.clone(),
                    }),
                )
                .unwrap(),
            ))
            .unwrap();
    }

    fn handle_hello(
        &mut self,
        client: &mut Client<TlsStream<TcpStream>>,
        heartbeat_interval: u64,
        timeout_ms: u64,
    ) {
        self.timeout_ms = timeout_ms;
        //self.heartbeat_interval = heartbeat_interval;
        self.connection_info.heartbeat_interval = Duration::from_millis(heartbeat_interval);

        println!("hello {} {}", heartbeat_interval, timeout_ms);
        self.send_init(client);
    }

    fn handle_once_proof(
        &self,
        client: &mut Client<TlsStream<TcpStream>>,
        encrypted_nonce: String,
    ) {
        let bytes = general_purpose::STANDARD
            .decode(encrypted_nonce.as_bytes())
            .unwrap();

        let data = self.decrypt(bytes);

        use sha2::Digest;
        println!("data {:?}", general_purpose::STANDARD.encode(&data));
        let mut hasher = sha2::Sha256::new();
        hasher.update(data);
        let result = hasher.finalize();
        let base64 = general_purpose::URL_SAFE_NO_PAD.encode(&result);

        println!("{:?}", base64);
        client
            .send_message(&OwnedMessage::Text(
                serde_json::to_string(
                    &(mobile_auth_packets::MobileAuthGatewayPackets::NonceProofClient {
                        proof: base64.clone(),
                    }),
                )
                .unwrap(),
            ))
            .unwrap();
        println!("Sent proof");
    }
    fn conn(&self) -> Result<Client<TlsStream<TcpStream>>, WebSocketError> {
        use websocket::ClientBuilder;
        let mut headers = websocket::header::Headers::new();
        headers.set(websocket::header::Origin("https://discord.com".to_string()));
        let client = ClientBuilder::new(constants::MOBILE_AUTH)
            .unwrap()
            .custom_headers(&headers)
            .connect_secure(None);
        if client.is_err() {
            return Err(client.err().unwrap());
        }
        let client = client.unwrap();

        client.set_nonblocking(true).unwrap();
        Ok(client)
    }

    async fn get_token(&self, ticket: String) -> Result<String, GetTokenResponse> {
        let client = reqwest::Client::new();
        let res = client
            .post(constants::MOBILE_AUTH_GET_TOKEN)
            .header("Content-Type", "application/json")
            .body(serde_json::to_string(&(http_packets::Auth::Login { ticket: ticket })).unwrap())
            .send()
            .await
            .unwrap();

        let text = res.text().await.unwrap();
        println!("{}", text);
        let json = serde_json::from_str::<http_packets::Auth>(&text).unwrap();
        //res.json::<http_packets::Auth>().await.unwrap();
        match json {
            http_packets::Auth::LoginResponse { encrypted_token } => {
                let bytes = general_purpose::STANDARD
                    .decode(encrypted_token.as_bytes())
                    .unwrap();
                let token = String::from_utf8(self.decrypt(bytes)).unwrap();
                Ok(token)
            }
            Auth::Error {
                code,
                errors,
                message,
            } => {
                println!("{} {} {}", code, errors, message);
                Err(GetTokenResponse::Other(message))
            }
            Auth::RequireAuth {
                captcha_key,
                captcha_rqdata,
                captcha_rqtoken,
                captcha_service,
                captcha_sitekey,
            } => {
                println!("MobileAuth RequireAuth");
                Err(GetTokenResponse::RequireAuth {
                    captcha_key: captcha_key.clone(),
                    captcha_sitekey: captcha_sitekey.clone(),
                    captcha_service,
                    captcha_rqdata,
                    captcha_rqtoken,
                })
            }
            _ => {
                println!("Unknown");
                Err(GetTokenResponse::Other("Unknown".to_string()))
            }
        }
    }

    fn on_token_error(&self, err: GetTokenResponse, ticket: String) -> bool {
        match err {
            GetTokenResponse::Other(m) => {
                println!("Error: {}", m);
                self.emit_event(webview_packets::Auth::MobileAuthError { error: m })
                    .unwrap();
                return true;
            }
            GetTokenResponse::RequireAuth {
                captcha_key,
                captcha_sitekey,
                captcha_service,
                captcha_rqdata,
                captcha_rqtoken,
            } => {
                let site_key = captcha_sitekey.clone();
                if let State::LoginScreen {
                    captcha_sitekey: ref mut captcha_key,
                    ticket: ref mut new_ticket,
                    captcha_rqtoken: ref mut new_captcha_rqtoken,
                    ..
                } = *self.app_state.state.lock().unwrap()
                {
                    *captcha_key = site_key;
                    *new_ticket = Some(ticket);
                    *new_captcha_rqtoken = captcha_rqtoken;
                }
                println!("Captcha: {:?}", captcha_rqdata);
                self.emit_event(webview_packets::Auth::RequireAuthMobile {
                    captcha_key,
                    captcha_sitekey,
                    captcha_service,
                })
                .unwrap();
            }
        }
        false
    }

    pub async fn run(&mut self) {
        while !self.connect().await {
            *self.connected.lock().unwrap() = false;
            print!("Reconnecting");
        }
        println!("shutting down mobile auth")
    }

    pub async fn connect(&mut self) -> bool {
        println!("Connecting");

        *self.connected.lock().unwrap() = true;

        let client = self.conn();
        if client.is_err() {
            tokio::time::sleep(Duration::from_millis(10000)).await;
            return false;
        }
        let mut client = client.unwrap();

        self.connection_info.reset();

        let mut user_id = None;

        loop {
            let message = client.recv_message();

            let m = self.reciver.try_recv();
            if m.is_ok() {
                let m = m.unwrap();
                if matches!(m, OwnedMessage::Close(_)) {
                    return true;
                }
                client.send_message(&m).unwrap();
            }

            if message.is_ok() {
                let message = message.unwrap();
                match message {
                    OwnedMessage::Text(text) => {
                        println!("Text: {}", text);
                        match serde_json::from_str::<mobile_auth_packets::MobileAuthGatewayPackets>(
                            &text,
                        )
                        .unwrap()
                        {
                            MobileAuthGatewayPackets::HeartbeatAck {} => {
                                //ack_recived = true;
                                self.connection_info.ack_recived = true;
                            }
                            MobileAuthGatewayPackets::Hello {
                                heartbeat_interval,
                                timeout_ms,
                            } => {
                                //started = true;
                                self.connection_info.authed = true;
                                self.handle_hello(&mut client, heartbeat_interval, timeout_ms);
                            }
                            MobileAuthGatewayPackets::NonceProofServer { encrypted_nonce } => {
                                self.handle_once_proof(&mut client, encrypted_nonce)
                            }
                            MobileAuthGatewayPackets::PendingRemoteInit { fingerprint } => {
                                println!("Fingerprint: {}", fingerprint);
                                let new_qr_url =
                                    format!("https://discordapp.com/ra/{}", fingerprint);
                                self.emit_event(webview_packets::Auth::MobileQrcode {
                                    qrcode: Some(new_qr_url.clone()),
                                })
                                .unwrap();
                                let mut state = self.app_state.state.lock().unwrap();
                                match *state {
                                    State::LoginScreen { ref mut qr_url, .. } => {
                                        *qr_url = Some(new_qr_url);
                                    }
                                    _ => {}
                                }
                                println!("state: {:?}", state);
                            }
                            MobileAuthGatewayPackets::PendingTicket {
                                encrypted_user_payload,
                            } => {
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
                                self.emit_event(webview_packets::Auth::MobileTicketData {
                                    user_id: splited[0].to_string(),
                                    discriminator: splited[1].to_string(),
                                    avatar_hash: splited[2].to_string(),
                                    username: splited[3].to_string(),
                                })
                                .unwrap();
                            }
                            MobileAuthGatewayPackets::PendingLogin { ticket } => {
                                client.shutdown().unwrap();
                                match self.get_token(ticket.clone()).await {
                                    Ok(token) => {
                                        if let Some(user_id) = user_id {
                                            self.app_state.add_new_user(user_id.clone(), token);

                                            self.emit_event(webview_packets::Auth::LoginSuccess {
                                                user_id: user_id.clone(),
                                                user_settings: None,
                                            })
                                            .unwrap();
                                        }
                                        return true;
                                    }
                                    Err(message) => {
                                        if self.on_token_error(message, ticket.clone()) {
                                            return false;
                                        }
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

            send_heartbeat_websocket(
                &mut self.connection_info,
                &mut client,
                Some(MobileAuthGatewayPackets::Heartbeat {}),
            );
            //tokio thread sleep
            tokio::time::sleep(std::time::Duration::from_millis(10)).await;
        }
    }
}
