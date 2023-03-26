use std::{
    net::TcpStream,
    sync::{Arc, Mutex},
    time::Duration,
};

use base64::{engine::general_purpose, Engine};
use futures_util::{pin_mut, SinkExt, StreamExt};
use log::{debug, error, info, warn};
use rsa::{pkcs8::EncodePublicKey, PaddingScheme, RsaPrivateKey, RsaPublicKey};
use tauri::{AppHandle, Manager};
use tokio_tungstenite::{connect_async_tls_with_config, tungstenite::Message, WebSocketStream};
use websocket::{native_tls::TlsStream, sync::Client, OwnedMessage, WebSocketError};

use crate::{
    discord::{
        constants,
        http_packets::{self, Auth},
        mobile_auth_packets::{self, MobileAuthGatewayPackets},
    },
    main_app_state::{MainState, State},
    modules::{
        gateway::{GatewayError, GatewayResult},
        gateway_utils::{send_heartbeat, send_heartbeat_websocket},
    },
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
    pub public_key: Option<RsaPublicKey>,
    private_key: Option<RsaPrivateKey>,

    app_state: Arc<MainState>,

    handle: AppHandle,

    reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,

    connection_info: ConnectionInfo,

    user_id: Option<String>,
}
impl MobileAuthHandler {
    pub fn new(
        app_state: Arc<MainState>,
        handle: AppHandle,
        reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,
    ) -> Self {
        Self {
            app_state,
            public_key: None,
            private_key: None,
            handle,
            reciver,
            connection_info: ConnectionInfo::default(),
            user_id: None,
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
        info!("Generating keys...");
        let mut rng = rand::thread_rng();

        let bits = 2048;
        let private_key = RsaPrivateKey::new(&mut rng, bits).expect("failed to generate a key");
        let public_key = RsaPublicKey::from(&private_key);
        self.public_key = Some(public_key);
        self.private_key = Some(private_key);
        info!("Keys generated");
    }

    fn emit_event(&self, event: webview_packets::Auth) -> Result<(), tauri::Error> {
        debug!("emiting {:?}", event.clone());
        self.handle.emit_all("auth", event)?;

        Ok(())
    }

    async fn send_init(
        &self,
        client: &mut futures_util::stream::SplitSink<
            WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
            tokio_tungstenite::tungstenite::Message,
        >,
    ) {
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
            .send(Message::Text(
                serde_json::to_string(
                    &(mobile_auth_packets::MobileAuthGatewayPackets::Init {
                        encoded_public_key: public_key_base64.clone(),
                    }),
                )
                .unwrap(),
            ))
            .await
            .unwrap();
    }

    async fn handle_hello(
        &mut self,
        client: &mut futures_util::stream::SplitSink<
            WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
            tokio_tungstenite::tungstenite::Message,
        >,
        heartbeat_interval: u64,
        timeout_ms: u64,
    ) {
        self.connection_info.timeout_ms = timeout_ms;
        self.connection_info.heartbeat_interval = Duration::from_millis(heartbeat_interval);

        println!("hello {} {}", heartbeat_interval, timeout_ms);
        self.send_init(client).await;
    }

    async fn handle_once_proof(
        &self,
        client: &mut futures_util::stream::SplitSink<
            WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
            tokio_tungstenite::tungstenite::Message,
        >,
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
            .send(Message::Text(
                serde_json::to_string(
                    &(mobile_auth_packets::MobileAuthGatewayPackets::NonceProofClient {
                        proof: base64.clone(),
                    }),
                )
                .unwrap(),
            ))
            .await
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

        let json = res.json::<http_packets::Auth>().await.unwrap();
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
                error!("{} {} {}", code, errors, message);
                Err(GetTokenResponse::Other(message))
            }
            Auth::RequireAuth {
                captcha_key,
                captcha_rqdata,
                captcha_rqtoken,
                captcha_service,
                captcha_sitekey,
            } => {
                info!("MobileAuth RequireAuth");
                Err(GetTokenResponse::RequireAuth {
                    captcha_key: captcha_key.clone(),
                    captcha_sitekey: captcha_sitekey.clone(),
                    captcha_service,
                    captcha_rqdata,
                    captcha_rqtoken,
                })
            }
            _ => {
                error!("Unknown");
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
        loop {
            let res = self.connect().await;
            if let Ok(res) = res {
                if matches!(res, GatewayResult::Close) {
                    break;
                }
            } else {
                println!("Error: {:?}", res);
                tokio::time::sleep(Duration::from_millis(10000)).await;
            }

            info!("Reconnecting");
        }
        info!("shutting down mobile auth")
    }

    // pub async fn connect_old(&mut self) -> bool {
    //     println!("Connecting");

    //     *self.connected.lock().unwrap() = true;

    //     let client = self.conn();
    //     if client.is_err() {
    //         tokio::time::sleep(Duration::from_millis(10000)).await;
    //         return false;
    //     }
    //     let mut client = client.unwrap();

    //     self.connection_info.reset();

    //     let mut user_id = None;

    //     loop {
    //         let message = client.recv_message();

    //         let m = self.reciver.try_recv();
    //         if m.is_ok() {
    //             let m = m.unwrap();
    //             if matches!(m, OwnedMessage::Close(_)) {
    //                 return true;
    //             }
    //             client.send_message(&m).unwrap();
    //         }

    //         if message.is_ok() {
    //             let message = message.unwrap();
    //             match message {
    //                 OwnedMessage::Text(text) => {
    //                     println!("Text: {}", text);
    //                     match serde_json::from_str::<mobile_auth_packets::MobileAuthGatewayPackets>(
    //                         &text,
    //                     )
    //                     .unwrap()
    //                     {
    //                         MobileAuthGatewayPackets::HeartbeatAck {} => {
    //                             //ack_recived = true;
    //                             self.connection_info.ack_recived = true;
    //                         }
    //                         MobileAuthGatewayPackets::Hello {
    //                             heartbeat_interval,
    //                             timeout_ms,
    //                         } => {
    //                             //started = true;
    //                             self.connection_info.authed = true;
    //                             self.handle_hello(&mut client, heartbeat_interval, timeout_ms);
    //                         }
    //                         MobileAuthGatewayPackets::NonceProofServer { encrypted_nonce } => {
    //                             self.handle_once_proof(&mut client, encrypted_nonce)
    //                         }
    //                         MobileAuthGatewayPackets::PendingRemoteInit { fingerprint } => {
    //                             println!("Fingerprint: {}", fingerprint);
    //                             let new_qr_url =
    //                                 format!("https://discordapp.com/ra/{}", fingerprint);
    //                             self.emit_event(webview_packets::Auth::MobileQrcode {
    //                                 qrcode: Some(new_qr_url.clone()),
    //                             })
    //                             .unwrap();
    //                             let mut state = self.app_state.state.lock().unwrap();
    //                             match *state {
    //                                 State::LoginScreen { ref mut qr_url, .. } => {
    //                                     *qr_url = Some(new_qr_url);
    //                                 }
    //                                 _ => {}
    //                             }
    //                             println!("state: {:?}", state);
    //                         }
    //                         MobileAuthGatewayPackets::PendingTicket {
    //                             encrypted_user_payload,
    //                         } => {
    //                             println!("Ticket: {}", encrypted_user_payload);
    //                             let decrypted = general_purpose::STANDARD
    //                                 .decode(encrypted_user_payload.as_bytes())
    //                                 .unwrap();
    //                             let decrypted = self.decrypt(decrypted);
    //                             //split decrypted :
    //                             let string = String::from_utf8(decrypted).unwrap();
    //                             let splited = string.split(':').collect::<Vec<&str>>();
    //                             println!("{:?}", string);
    //                             user_id = Some(splited[0].to_string());
    //                             self.emit_event(webview_packets::Auth::MobileTicketData {
    //                                 user_id: splited[0].to_string(),
    //                                 discriminator: splited[1].to_string(),
    //                                 avatar_hash: splited[2].to_string(),
    //                                 username: splited[3].to_string(),
    //                             })
    //                             .unwrap();
    //                         }
    //                         MobileAuthGatewayPackets::PendingLogin { ticket } => {
    //                             client.shutdown().unwrap();
    //                             match self.get_token(ticket.clone()).await {
    //                                 Ok(token) => {
    //                                     if let Some(user_id) = user_id {
    //                                         self.app_state.add_new_user(user_id.clone(), token);

    //                                         self.emit_event(webview_packets::Auth::LoginSuccess {
    //                                             user_id: user_id.clone(),
    //                                             user_settings: None,
    //                                         })
    //                                         .unwrap();
    //                                     }
    //                                     return true;
    //                                 }
    //                                 Err(message) => {
    //                                     if self.on_token_error(message, ticket.clone()) {
    //                                         return false;
    //                                     }
    //                                 }
    //                             }
    //                             return true;
    //                         }
    //                         _ => {}
    //                     }
    //                 }
    //                 OwnedMessage::Close(reason) => {
    //                     println!("Close {:?}", reason);
    //                     return false;
    //                 }
    //                 m => {
    //                     println!("Not text {:?}", m);
    //                 }
    //             }
    //         }

    //         send_heartbeat_websocket(
    //             &mut self.connection_info,
    //             &mut client,
    //             Some(MobileAuthGatewayPackets::Heartbeat {}),
    //         );
    //         //tokio thread sleep
    //         tokio::time::sleep(std::time::Duration::from_millis(10)).await;
    //     }
    // }

    async fn handle_events(
        &mut self,
        client: &mut futures_util::stream::SplitSink<
            WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
            tokio_tungstenite::tungstenite::Message,
        >,
        event: MobileAuthGatewayPackets,
    ) -> Result<GatewayResult, GatewayError> {
        match event {
            MobileAuthGatewayPackets::HeartbeatAck {} => {
                self.connection_info.ack_recived = true;
            }
            MobileAuthGatewayPackets::Hello {
                heartbeat_interval,
                timeout_ms,
            } => {
                self.connection_info.authed = true;
                self.handle_hello(client, heartbeat_interval, timeout_ms)
                    .await;
            }
            MobileAuthGatewayPackets::Init { encoded_public_key } => todo!(),
            MobileAuthGatewayPackets::NonceProofServer { encrypted_nonce } => {
                self.handle_once_proof(client, encrypted_nonce).await;
            }
            MobileAuthGatewayPackets::PendingRemoteInit { fingerprint } => {
                println!("Fingerprint: {}", fingerprint);
                let new_qr_url = format!("https://discordapp.com/ra/{}", fingerprint);
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
                self.user_id = Some(splited[0].to_string());
                self.emit_event(webview_packets::Auth::MobileTicketData {
                    user_id: splited[0].to_string(),
                    discriminator: splited[1].to_string(),
                    avatar_hash: splited[2].to_string(),
                    username: splited[3].to_string(),
                })
                .unwrap();
            }
            MobileAuthGatewayPackets::PendingLogin { ticket } => {
                match self.get_token(ticket.clone()).await {
                    Ok(token) => {
                        if let Some(user_id) = self.user_id.as_ref() {
                            self.app_state.add_new_user(user_id.clone(), token);

                            self.emit_event(webview_packets::Auth::LoginSuccess {
                                user_id: user_id.clone(),
                                user_settings: None,
                            })
                            .unwrap();
                        }
                        return Ok(GatewayResult::Close);
                    }
                    Err(message) => {
                        if self.on_token_error(message, ticket.clone()) {
                            return Ok(GatewayResult::Reconnect);
                        }
                    }
                }
                return Ok(GatewayResult::Close);
            }
            MobileAuthGatewayPackets::Cancel {} => todo!(),
            _ => {}
        }
        Ok(GatewayResult::Continue)
    }

    pub async fn connect(&mut self) -> Result<GatewayResult, GatewayError> {
        let req = tokio_tungstenite::tungstenite::handshake::client::Request::builder()
            .method("GET")
            .header("Host", "remote-auth-gateway.discord.gg")
            .header("Connection", "Upgrade")
            .header("Upgrade", "websocket")
            .header("Sec-WebSocket-Version", "13")
            .header(
                "Sec-WebSocket-Key",
                tokio_tungstenite::tungstenite::handshake::client::generate_key(),
            )
            .uri(constants::MOBILE_AUTH)
            .header("Origin", "https://discord.com")
            .body(())
            .unwrap();
        let result = connect_async_tls_with_config(req, None, None).await;
        if let Err(err) = result {
            error!("Failed to connect to gateway: {}", err);
            return Err(GatewayError::Other);
        }

        let (stream, response) = result.unwrap();
        if response.status() != 101 {
            error!("Invalid status code: {}", response.status());
            return Err(GatewayError::WrongStatus);
        }

        let (mut write, mut read) = stream.split();

        let (s, mut r) = tokio::sync::mpsc::channel(5);

        #[derive(Debug)]
        enum ReciveLoopError {
            ReciveError(tokio_tungstenite::tungstenite::Error),
            SendError(tokio::sync::mpsc::error::SendError<Message>),
        }

        let recive_loop = async move {
            loop {
                let rec = read.next().await;

                if let Some(rec) = rec {
                    if let Ok(msg) = rec {
                        if let Err(err) = s.send(msg).await {
                            return ReciveLoopError::SendError(err);
                        }
                    } else {
                        return ReciveLoopError::ReciveError(rec.err().unwrap());
                    }
                } else {
                    return ReciveLoopError::ReciveError(
                        tokio_tungstenite::tungstenite::Error::ConnectionClosed,
                    );
                }
            }
        };
        let main_loop = async move {
            loop {
                if let Ok(message) = self.reciver.try_recv() {
                    if matches!(message, OwnedMessage::Close(_)) {
                        return Ok(GatewayResult::Close);
                    }
                }

                if let Ok(message) = r.try_recv() {
                    match message {
                        Message::Text(message) => {
                            let event =
                                serde_json::from_str::<MobileAuthGatewayPackets>(&message).unwrap();
                            let result = self.handle_events(&mut write, event).await;
                            if let Ok(result) = result {
                                if !matches!(result, GatewayResult::Continue) {
                                    return Ok(result);
                                }
                            } else {
                                return result;
                            }
                        }
                        Message::Close(frame) => {
                            error!("close frame {:?}", frame);
                            return Ok(GatewayResult::Reconnect);
                        }
                        _ => {
                            warn!("unknown message {:?}", message);
                        }
                    }
                }

                let res = send_heartbeat(
                    &mut self.connection_info,
                    &mut write,
                    Some(MobileAuthGatewayPackets::Heartbeat {}),
                )
                .await;
                if let Ok(res) = res {
                    if !res {
                        return Ok(GatewayResult::Reconnect);
                    }
                } else {
                    return Err(GatewayError::Other);
                }

                tokio::time::sleep(Duration::from_millis(5)).await;
            }
        };
        pin_mut!(recive_loop, main_loop);
        use tokio::select;
        let res = select! {
            res = recive_loop => {
                error!("error while Sending {:?}",res);
                Err(GatewayError::Other)
            },
            res = main_loop =>{
                info!("recive_loop ended {:?}",res);
                res
            }
        };
        res
    }
}
