use std::{
    collections::HashMap,
    future,
    iter::Map,
    net::TcpStream,
    sync::Arc,
    time::{Duration, Instant}, io::Write,
};

use base64::Engine;
use flate2::Decompress;
use futures_util::{future::select, stream::SplitStream, Future, FutureExt, SinkExt};
use serde_json::json;
use sha2::Digest;
use tauri::{AppHandle, Manager};
use tokio::{sync::oneshot, fs::File};
use tokio_tungstenite::{
    connect_async_tls_with_config, tungstenite::Message, MaybeTlsStream, WebSocketStream,
};
use websocket::{native_tls::TlsStream, sync::Client, CloseData, OwnedMessage};

use tokio::sync::RwLock;

use crate::{
    discord::{
        constants::GATEWAY_CONNECT,
        gateway_packets::{GatewayIncomingPacket, GatewayPackets, GatewayPacketsData},
        types::gateway::{ClientState, Presence, Properties},
    },
    main_app_state::{self, MainState, UserData},
    modules::gateway_utils::{send_heartbeat, send_heartbeat_websocket},
    notifications,
    webview_packets::{self, GatewayEvent},
};

use super::gateway_utils::ConnectionInfo;

#[derive(Debug)]
pub enum GatewayError {
    InvalidApiVersion,
    Other,
}

#[derive(Debug)]
pub enum GatewayResult {
    Close,
    Reconnect,
    ReconnectUsingResumeUrl,
}

#[derive(Debug)]
pub struct Gateway {
    pub timeout_ms: u64,
    pub state: Arc<MainState>,

    resume_url: Option<String>,

    session_id: Option<String>,

    seq: Option<u64>,

    decoder: Decompress,

    token: String,
    user_id: String,

    pub running: bool,

    handle: AppHandle,

    reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,

    connection_info: ConnectionInfo,

    use_resume_url: bool,
}
impl Gateway {
    pub fn new(
        state: Arc<MainState>,
        handle: AppHandle,
        reciver: tokio::sync::mpsc::Receiver<OwnedMessage>,
        token: String,
        user_id: String,
    ) -> Self {
        Self {
            state,
            timeout_ms: 0,
            running: false,
            handle,
            reciver,
            token,
            user_id,
            connection_info: ConnectionInfo::default(),
            resume_url: None,
            session_id: None,
            seq: None,
            decoder: Decompress::new(true),
            use_resume_url: false,
        }
    }
    async fn handle_events(
        &mut self,
        client: &mut futures_util::stream::SplitSink<
            WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
            tokio_tungstenite::tungstenite::Message,
        >,
        event: GatewayIncomingPacket,
    ) -> Result<(), GatewayError> {
        match event.d {
            GatewayPacketsData::Hello { heartbeat_interval } => {
                self.connection_info.heartbeat_interval = Duration::from_millis(heartbeat_interval);
                self.init_message(client, self.token.clone()).await;
                self.connection_info.authed = true;
                println!("Hello {:?}", self.connection_info);
            }
            GatewayPacketsData::Ready(data) => {
                println!("Ready {:?}", data);
                self.resume_url = Some(data.resume_gateway_url);
                self.session_id = Some(data.session_id);
                if self.user_id != data.user.id {
                    println!("Wrong user id {} != {}", self.user_id, data.user.id);
                    return Err(GatewayError::Other);
                }
                let user = UserData::new(
                    data.user.clone(),
                    self.token.clone(),
                    data.users,
                    data.guilds,
                    data.private_channels,
                    data.relationships,
                );

                let mut user_data = self.state.users.lock().unwrap();

                if user_data.contains_key(&self.user_id) {
                    println!("Removing old user data");
                    user_data.remove(&self.user_id);
                }
                user_data.insert(self.user_id.clone(), main_app_state::User::ActiveUser(user));
                println!("Ready {:?} {:?}", user_data, user_data.get(&self.user_id));
            }
            GatewayPacketsData::ReadySupplemental {
                merged_presences,
                merged_members,
                lazy_private_channels,
                guilds,
            } => {
                println!("ReadySupplemental {:?}", guilds);
            }
            GatewayPacketsData::MessageEvent {
                message,
                member,
                guild_id,
                mentions,
            } => {
                println!("Message {:?}", message);
                let package;
                match event.t.clone().unwrap().as_str() {
                    "MESSAGE_CREATE" => {
                        package = webview_packets::Gateway::MessageCreate {
                            message: message.clone(),
                            mentions,
                            member: member,
                            guild_id: guild_id,
                        };
                    }
                    "MESSAGE_UPDATE" => {
                        package = webview_packets::Gateway::MessageUpdate {
                            message: message.clone(),
                            mentions,
                            member: member,
                            guild_id: guild_id,
                        };
                    }
                    _ => {
                        println!("Unknown message event {:?}", event.t);
                        package = webview_packets::Gateway::Error {
                            message: "Unknown message event".to_string(),
                        };
                    }
                }
                self.emit_event(package).unwrap();

                if !self.state.get_users_ids().contains(&message.author.id) {
                    let handle = self.handle.clone();
                    let user_data = self.state.get_user_data(self.user_id.clone());
                    println!("{:?}", user_data);
                    tauri::async_runtime::spawn(async move {
                        println!("notification");
                        notifications::new_message(message, &handle, user_data).await;
                    });
                }
            }
            GatewayPacketsData::HeartbeatAck => {
                self.connection_info.ack_recived = true;
            }
            _ => {
                println!("Not handled {:?}", event);
            }
        }
        Ok(())
    }

    fn conn(&mut self) -> Client<TlsStream<TcpStream>> {
        use websocket::ClientBuilder;
        let mut headers = websocket::header::Headers::new();
        headers.set(websocket::header::Origin("https://discord.com".to_string()));
        let url;
        println!("use {}", self.use_resume_url);
        if self.use_resume_url {
            url = self.resume_url.as_ref().unwrap().clone();
        } else {
            url = GATEWAY_CONNECT.to_string();
        }

        let mut client = ClientBuilder::new(url.as_str())
            .unwrap()
            .custom_headers(&headers)
            .connect_secure(None)
            .unwrap();
        client.set_nonblocking(true).unwrap();
        if self.use_resume_url {
            client
                .send_message(&OwnedMessage::Text(
                    serde_json::to_string(
                        &(GatewayPackets::Resume {
                            token: self.token.clone(),
                            session_id: self.session_id.as_ref().unwrap().clone(),
                            seq: self.seq.unwrap().clone(),
                        }),
                    )
                    .unwrap(),
                ))
                .unwrap();
            println!("resuming");
        }
        self.use_resume_url = false;
        client
    }
    pub async fn run(&mut self) {
        self.running = true;

        while let Ok(result) = self.connect().await {
            print!("Reconnecting");
            if matches!(result, GatewayResult::ReconnectUsingResumeUrl) {
                self.use_resume_url = true;
            }
        }
        self.running = false;
        println!("shutting down gateway")
    }

    fn emit_event(&self, event: webview_packets::Gateway) -> Result<(), tauri::Error> {
        self.handle.emit_all(
            "gateway",
            GatewayEvent {
                event,
                user_id: self.user_id.clone(),
            },
        )?;
        Ok(())
    }

    async fn init_message(
        &self,
        client: &mut futures_util::stream::SplitSink<
            WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
            tokio_tungstenite::tungstenite::Message,
        >,
        token: String,
    ) {
        let data = GatewayPackets::Identify {
            token,
            capabilities: 4093,

            properties: Properties::default(),
            presence: Presence::default(),
            compress: false,
            client_state: ClientState {
                guild_versions: HashMap::new(),
                highest_last_message_id: "0".to_string(),
                read_state_version: 0,
                user_guild_settings_version: -1,
                user_settings_version: -1,
                private_channels_version: "0".to_string(),
                api_code_version: 0,
            },
        };
        //println!("{:?}", serde_json::to_string(&data).unwrap());

        client
            .send(Message::Text(serde_json::to_string(&data).unwrap()))
            .await
            .unwrap();
    }

    fn on_close(&self, reason: Option<CloseData>) -> Result<GatewayResult, GatewayError> {
        if let Some(reason) = reason {
            match reason.status_code {
                4004 => {
                    println!("Invalid token");
                    return Err(GatewayError::Other);
                }
                4013 | 4014 => {
                    println!("Invalid intent");
                    return Err(GatewayError::Other);
                }
                4012 => {
                    println!("invalid api version");
                    return Err(GatewayError::InvalidApiVersion);
                }
                4010 | 4011 => {
                    println!("how? also gami is a furry");
                    return Ok(GatewayResult::Reconnect);
                }
                1000 | 1001 => {
                    println!("normal close?");
                    return Ok(GatewayResult::Reconnect);
                }
                _ => {
                    return Ok(GatewayResult::Reconnect);
                }
            }
        }
        return Ok(GatewayResult::Reconnect);
    }

    pub async fn connect_old(&mut self) -> Result<GatewayResult, GatewayError> {
        println!("Connecting");

        let mut client = self.conn();

        self.connection_info.reset();
        self.decoder.reset(true);

        let mut buffer = Vec::<u8>::new();

        //self.init_message(&mut client, self.token.clone());

        loop {
            let message = client.recv_message();

            let m = self.reciver.try_recv();
            if let Ok(m) = m {
                println!("recived {:?}", m);
                if matches!(m, OwnedMessage::Close(_)) {
                    return Ok(GatewayResult::Close);
                }
                return Ok(GatewayResult::ReconnectUsingResumeUrl);
                //client.send_message(&m).unwrap();
            }

            if message.is_ok() {
                let message = message.unwrap();
                println!("control {:?}", message.is_control());
                match message {
                    OwnedMessage::Close(reason) => {
                        println!("Close {:?}", reason);
                        return Err(GatewayError::Other);
                        //self.on_close(reason);
                    }
                    OwnedMessage::Binary(bin) => {
                        buffer.extend(bin.clone());

                        let mut last_4 = [0u8; 4];
                        last_4.copy_from_slice(&bin[bin.len() - 4..]);
                        if last_4 == [0, 0, 255, 255] {
                            let mut buf = Vec::with_capacity(20_971_520); // 20mb
                            self.decoder
                                .decompress_vec(&buffer, &mut buf, flate2::FlushDecompress::Sync)
                                .unwrap();

                            let out = String::from_utf8(buf).unwrap();
                            println!("Gateway recived: {:?}", out);
                            let json: GatewayIncomingPacket =
                                serde_json::from_str(out.as_str()).unwrap();
                            self.seq = json.s.clone();

                            panic!("Deprecated");
                            // if let Err(err) = self.handle_events(&mut client, json).await {
                            //     return Err(err);
                            // }
                            buffer.clear();
                        }
                    }
                    m => {
                        println!("Not text {:?}", m);
                    }
                }
            }
            panic!("Deprecated");
            // let res = send_heartbeat(
            //     &mut self.connection_info,
            //     &mut client,
            //     Some(GatewayPackets::Heartbeat {
            //         d: self.seq.clone(),
            //     }),
            // );
            // if let Some(res) = res {
            //     if !res {
            //         return Ok(GatewayResult::Reconnect);
            //     }
            // }
            //tokio thread sleep
            tokio::time::sleep(std::time::Duration::from_millis(5)).await;
        }
    }

    pub async fn connect(&mut self) -> Result<GatewayResult, GatewayError> {
        use futures_util::{pin_mut, stream::StreamExt};

        let (stream, response) = connect_async_tls_with_config(GATEWAY_CONNECT, None, None)
            .await
            .unwrap(); //todo use result

        self.connection_info.reset();
        self.decoder.reset(true);

        let (mut write, mut read) = stream.split();

        let (s, mut r) = tokio::sync::mpsc::channel(5);

        let recive_loop = async move {
            loop {
                let rec = read.next().await.unwrap();
                if let Ok(msg) = rec {
                    if let Err(err) = s.send(msg).await {
                        return err;
                    }
                }
            }
        };

        let mut buffer = Vec::<u8>::new();

        let main_loop = async move {
            loop {
                if let Ok(message) = r.try_recv() {
                    //println!("{:?}", message);
                    match message {
                        tokio_tungstenite::tungstenite::Message::Binary(bin) => {
                            buffer.extend(bin.clone());

                            let mut last_4 = [0u8; 4];
                            last_4.copy_from_slice(&bin[bin.len() - 4..]);
                            if last_4 == [0, 0, 255, 255] {
                                let mut buf = Vec::with_capacity(20_971_520); // 20mb
                                self.decoder
                                    .decompress_vec(
                                        &buffer,
                                        &mut buf,
                                        flate2::FlushDecompress::Sync,
                                    )
                                    .unwrap();

                                let out = String::from_utf8(buf.clone()).unwrap();


                                use::sha2::Sha256;

                                let mut hasher = Sha256::new();
                                let a;
                                if buf.len() < 256*2{
                                    a = 0..buf.len();
                                }else{
                                    a = buf.len() - 256..buf.len();
                                }
                                hasher.update(&buf[a]);
                                let a = hasher.finalize();
                                let name = base64::engine::general_purpose::URL_SAFE.encode(a);
                                println!("{:?}",name);
                                let p = self.handle.path_resolver().app_cache_dir().unwrap();
                                let mut file = std::fs::File::create(p.join(format!("d/{}.json",name))).unwrap();
                                file.write_all(out.as_bytes());

                                // println!("Gateway recived: {:?}", out);
                                let json: GatewayIncomingPacket =
                                    serde_json::from_str(out.as_str()).unwrap();
                                self.seq = json.s.clone();

                                if let Err(err) = self.handle_events(&mut write, json).await {
                                    return Err(err);
                                }
                                buffer.clear();
                            }
                        }

                        tokio_tungstenite::tungstenite::Message::Close(frame) => {
                            println!("Close {:?}", frame);
                            return Err(GatewayError::Other);
                            // return self.on_close(reason);
                        }

                        _ => {}
                    }
                }

                if let Ok(message) = self.reciver.try_recv() {
                    println!("recived {:?}", message);
                    if matches!(message, OwnedMessage::Close(_)) {
                        return Ok(GatewayResult::Close);
                    }
                    return Ok(GatewayResult::ReconnectUsingResumeUrl);
                    //client.send_message(&m).unwrap();
                }

                let res = send_heartbeat(
                    &mut self.connection_info,
                    &mut write,
                    Some(GatewayPackets::Heartbeat { d: self.seq }),
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
                println!("error while Sending {:?}",res);
                Err(GatewayError::Other)
            },
            res = main_loop =>{
                println!("recive_loop ended {:?}",res);
                res
            }
        };
        res
    }
}
