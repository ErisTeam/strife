use std::sync::{ Arc };

use base64::Engine;
use log::debug;
use packets::IncomingPackets;
use rsa::{ pkcs8::EncodePublicKey, RsaPrivateKey, RsaPublicKey };
use tokio::sync::Notify;
use tokio_util::sync::CancellationToken;
use websocket_strife::Connection;

pub mod packets;

pub const REMOTE_AUTH_ENDPOINT: &str = "wss://remote-auth-gateway.discord.gg/?v=2";

fn generate_rsa_keys() -> anyhow::Result<(RsaPublicKey, RsaPrivateKey), rsa::errors::Error> {
    debug!("Generating rsa keys...");
    let mut rng = rand::thread_rng();

    let bits = 2048;
    let private_key = RsaPrivateKey::new(&mut rng, bits)?;
    let public_key = RsaPublicKey::from(&private_key);

    debug!("Keys generated");
    Ok((public_key, private_key))
}
async fn send_packet(
    connection: &Connection,
    message: packets::OutGoingPackets
) -> anyhow::Result<()> {
    let json = serde_json::to_string(&message)?;
    connection.send_message(websocket_strife::WebsocketMessage::Text(json)).await?;
    Ok(())
}

pub struct RemoteAuth {
    connection: Arc<websocket_strife::Connection>,
    cancellation_token: CancellationToken,
}
impl RemoteAuth {
    pub fn new() -> Self {
        Self {
            connection: websocket_strife::Connection::new(),
            cancellation_token: CancellationToken::new(),
        }
    }
    pub async fn start(&self, url: &str) -> anyhow::Result<()> {
        let mut start_heartbeat = Notify::new();
        let connection = self.connection.clone();

        let heartbeat_interval = Arc::new(tokio::sync::RwLock::new(0_u64));
        let heartbeat_notifyer = Arc::new(Notify::new());
        {
            let heartbeat_notifyer = heartbeat_notifyer.clone();
            let connection = connection.clone();
            tokio::spawn(async move {
                let mut key_pair = generate_rsa_keys()?;
                while let Ok(message) = connection.reader().recv().await {
                    match message {
                        websocket_strife::WebsocketMessage::Text(payload) => {
                            let parse_payload: packets::IncomingPackets = serde_json::from_str(
                                &payload
                            )?;
                            match parse_payload {
                                IncomingPackets::Hello { heartbeat_interval: hi, timeout_ms } => {
                                    let encoded_public_key =
                                        base64::engine::general_purpose::STANDARD.encode(
                                            key_pair.0.to_public_key_der()?
                                        );
                                    send_packet(&connection, packets::OutGoingPackets::Init {
                                        encoded_public_key,
                                    }).await?;
                                    *heartbeat_interval.write().await = hi;
                                }
                                IncomingPackets::NonceProof { encrypted_nonce } => todo!(),
                                IncomingPackets::HeartbeatAck => todo!(),
                                IncomingPackets::PendingRemoteInit { fingerprint } => todo!(),
                                IncomingPackets::PendingTicket { encrypted_user_payload } =>
                                    todo!(),
                                IncomingPackets::PendingLogin { ticket } => todo!(),
                                IncomingPackets::Cancel {} => todo!(),
                            }
                        }
                        websocket_strife::WebsocketMessage::Close => {}
                        websocket_strife::WebsocketMessage::Restart => {}
                        | websocket_strife::WebsocketMessage::Start
                        | websocket_strife::WebsocketMessage::Resume => todo!(),
                        _ => {}
                    }
                }
                Ok::<(), anyhow::Error>(())
            });
        }
        let (ws, _res) = Connection::create_websocket_url(
            url,
            vec![("Origin".to_string(), "https://discord.com".to_string())]
        ).await?;
        connection.start_existing(ws).await;
        Ok(())
    }
}
