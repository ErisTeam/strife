use std::{collections::HashMap, io::Write, sync::Arc, time::Duration};

use flate2::Decompress;
use futures_util::SinkExt;

use log::{error, info, warn};
use serde_json::json;
use tauri::{AppHandle, Manager};
use tokio_tungstenite::{
    connect_async_tls_with_config,
    tungstenite::{protocol::CloseFrame, Message},
    WebSocketStream,
};
use websocket::OwnedMessage;

use crate::{
    discord::{
        constants::GATEWAY_CONNECT,
        gateway_packets::{GatewayIncomingPacket, GatewayPackets, GatewayPacketsData},
        types::gateway::{ClientState, Presence, Properties},
    },
    main_app_state::{self, MainState, UserData},
    modules::gateway_utils::send_heartbeat,
    notifications,
    webview_packets::{self, GatewayEvent},
};

use super::gateway_utils::ConnectionInfo;

#[derive(Debug)]
pub enum GatewayError {
    InvalidApiVersion,
    WrongStatus,
    Other,
}

#[derive(Debug)]
pub enum GatewayResult {
    Close,
    Reconnect,
    ReconnectUsingResumeUrl,
    Continue,
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
                self.resume_url = Some(data.resume_gateway_url);
                self.session_id = Some(data.session_id);
                if self.user_id != data.user.id {
                    error!("Wrong user id {} != {}", self.user_id, data.user.id);
                    return Err(GatewayError::Other);
                }
                let user = UserData::new(
                    data.user.clone(),
                    self.token.clone(),
                    data.users,
                    data.guilds,
                    data.user_guild_settings,
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

                self.emit_event(webview_packets::Gateway::Started).unwrap();
            }
            GatewayPacketsData::ReadySupplemental {
                merged_presences,
                merged_members,
                lazy_private_channels,
                guilds,
            } => {
                println!("ReadySupplemental {:?}", guilds);
                let gami;
                let state;
                let emoji;
                if &self.user_id == "309689147855994880" {
                    gami = true;
                    state = "I'm a furry";
                    emoji = json!({
                        "emoji_id": null,
                        "name": "🐶",
                        "animated":false
                    });
                } else {
                    gami = false;
                    state = "Gami to furras";
                    emoji = json!(null);
                }
                crate::test::gami_to_furras(self.token.clone(), gami).await;

                client
                    .send(Message::Text(
                        serde_json::to_string(&GatewayPackets::UpdatePresence {
                            since: None,
                            activities: vec![json!({
                                "name":	"Custom Status",
                                "type": 4,
                                "state": state,
                                "emoji": emoji
                            })],
                            status: "online".to_string(),
                            afk: false,
                        })
                        .unwrap(),
                    ))
                    .await
                    .unwrap();
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

                    if let Some(user_data) = &user_data {
                        let guild = user_data.get_guild_by_channel(&message.channel_id);
                        if let Some(guild) = guild {
                            let settings = user_data.guild_settings.get(&guild.properties.id);
                            if let Some(settings) = settings {
                                let channel = settings
                                    .channel_overrides
                                    .iter()
                                    .find(|x| x.channel_id == message.channel_id);
                                let mute;
                                if let Some(channel) = channel {
                                    mute = channel.muted;
                                } else {
                                    mute = settings.muted;
                                }
                                println!("Mute: {}", mute);
                                if mute {
                                    return Ok(());
                                }
                            }
                        }
                    }

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
                error!("Not handled {:?}", event);
            }
        }
        Ok(())
    }

    pub async fn run(&mut self) {
        while let Ok(result) = self.connect().await {
            info!("Reconnecting");
            if matches!(result, GatewayResult::ReconnectUsingResumeUrl) {
                self.use_resume_url = true;
            }
        }

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

    async fn send_resume(
        &self,
        client: &mut futures_util::stream::SplitSink<
            WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
            tokio_tungstenite::tungstenite::Message,
        >,
    ) -> Result<(), tokio_tungstenite::tungstenite::Error> {
        client
            .send(tokio_tungstenite::tungstenite::Message::Text(
                serde_json::to_string(
                    &(GatewayPackets::Resume {
                        token: self.token.clone(),
                        session_id: self.session_id.as_ref().unwrap().clone(),
                        seq: self.seq.unwrap().clone(),
                    }),
                )
                .unwrap(),
            ))
            .await
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

    fn on_close(&self, frame: Option<CloseFrame>) -> Result<GatewayResult, GatewayError> {
        if let Some(frame) = frame {
            match frame.code {
                tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode::Normal => {
                    warn!("Normal close");
                    return Ok(GatewayResult::ReconnectUsingResumeUrl);
                }
                tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode::Library(
                    4004,
                ) => {
                    warn!("Invalid token");
                    return Err(GatewayError::Other);
                }
                tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode::Library(
                    4010 | 4011,
                ) => {
                    error!("how? also gami is a furry");
                    return Ok(GatewayResult::Reconnect);
                }
                tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode::Library(
                    4012,
                ) => {
                    error!("invalid api version");
                    return Err(GatewayError::InvalidApiVersion);
                }
                tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode::Library(
                    4013 | 4014,
                ) => {
                    error!("Invalid intent");
                    return Err(GatewayError::Other);
                }

                r => {
                    warn!("Unknown close code {:?}", r);
                    return Ok(GatewayResult::Reconnect);
                }
            }
        }
        return Ok(GatewayResult::Reconnect);
    }

    pub async fn connect(&mut self) -> Result<GatewayResult, GatewayError> {
        use futures_util::{pin_mut, stream::StreamExt};

        let url;
        if self.use_resume_url && self.resume_url.is_some() {
            url = self.resume_url.clone().unwrap();
        } else {
            url = GATEWAY_CONNECT.to_string();
        }

        let result = connect_async_tls_with_config(url.clone(), None, None).await;
        if let Err(err) = result {
            error!("Failed to connect to gateway: {}", err);
            return Err(GatewayError::Other);
        }

        let (stream, response) = result.unwrap();
        if response.status() != 101 {
            error!("Invalid status code: {}", response.status());
            return Err(GatewayError::WrongStatus);
        }

        self.connection_info.reset();
        self.decoder.reset(true);

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

        let mut buffer = Vec::<u8>::new();

        let main_loop = async move {
            if self.use_resume_url && self.resume_url.is_some() {
                if let Err(err) = self.send_resume(&mut write).await {
                    error!("Failed to send resume: {}", err);
                    return Err(GatewayError::Other);
                }
            }

            loop {
                if let Ok(m) = self.reciver.try_recv() {
                    println!("recived {:?}", m);
                    if matches!(m, OwnedMessage::Close(_)) {
                        return Ok(GatewayResult::Close);
                    }
                    return Ok(GatewayResult::ReconnectUsingResumeUrl);
                    //client.send_message(&m).unwrap();
                }
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

                                //For debugging purposes
                                if cfg!(debug_assertions) {
                                    let time = chrono::Local::now().format("%y-%b-%d %H.%M.%S.%f");

                                    let packet =
                                        serde_json::from_str::<GatewayIncomingPacket>(out.as_str());
                                    let r#type;
                                    if let Ok(packet) = packet {
                                        r#type = packet.d.get_name();
                                    } else {
                                        r#type = "Failed to parse";
                                    }

                                    let p = self.handle.path_resolver().app_data_dir().unwrap();
                                    println!("{:?}", p);
                                    let mut file = std::fs::File::create(
                                        p.join(format!("gateway logs/{} {}.json", r#type, time)),
                                    )
                                    .unwrap();
                                    file.write_all(out.as_bytes()).unwrap();
                                }

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
                            info!("Close {:?}", frame);
                            return self.on_close(frame);

                            // return self.on_close(reason);
                        }

                        _ => {}
                    }
                }

                if let Ok(message) = self.reciver.try_recv() {
                    info!("recived {:?}", message);
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
        let res: Result<GatewayResult, GatewayError> = select! {
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
