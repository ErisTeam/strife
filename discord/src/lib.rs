use std::sync::Arc;

use websocket_connection::WebsocketConnection;
use websocket_trait::{ ConnectionInfo, WebsocketThreads };

pub mod types;
pub mod websocket_trait;
pub mod websocket_connection;
#[cfg(test)]
mod tests {
    use discord_macro::Websocket;
    use futures_util::StreamExt;
    use tokio::task::block_in_place;

    use super::*;

    const ECHO_SERVER: &str = "wss://echo.websocket.org/";

    /// Connects to wss://echo.websocket.org/ and waits for a message to be sent back
    #[test]
    fn connecting() {
        type ConnectionInfoL = ConnectionInfo<String, ()>;
        #[derive(Websocket)]
        #[websocket(connection_data = String)]
        struct TestWebsocket {}
        impl WebsocketThreads<ConnectionInfoL> for TestWebsocket {
            fn get_heartbeat_packet(
                connection_data: &ConnectionInfoL
            ) -> anyhow::Result<tokio_tungstenite::tungstenite::Message> {
                unimplemented!("not needed for this test")
            }

            async fn logic_thread(
                connection_data: Arc<tokio::sync::Mutex<ConnectionInfoL>>,
                websocket: Arc<WebsocketConnection>,
                _start_heartbeat: tokio::sync::oneshot::Sender<u64>
            ) {
                println!("logic_thread started");
                let message = connection_data.lock().await.aditional_data.clone();
                let r = websocket.send(
                    tokio_tungstenite::tungstenite::Message::Text(message.clone())
                ).await;
                println!("a: {:?}", r);

                while let Ok(m) = websocket.reader().await.lock().await.next().await.unwrap() {
                    println!("{:?}", m);
                    if m.is_text() && m.to_text().unwrap() == message {
                        println!("Received message");
                        break;
                    }
                }
            }
        }
        let websocket = TestWebsocket {};
        let (return_channel, _) = tokio::sync::mpsc::channel::<()>(5);

        let runtime = tokio::runtime::Runtime::new().unwrap();

        runtime.block_on(async {
            let result = websocket.start_websocket(
                String::from("Gami to furras!"),
                return_channel,
                ECHO_SERVER.to_string()
            ).await;
            assert!(result.is_ok());
        });
        println!("aaaa");
    }
    #[test]
    fn heartbeat_test() {
        type ConnectionInfoL = ConnectionInfo<u64, ()>;
        #[derive(Websocket)]
        #[websocket(connection_data = u64)]
        struct TestWebsocket {}
        impl WebsocketThreads<ConnectionInfoL> for TestWebsocket {
            fn get_heartbeat_packet(
                connection_data: &ConnectionInfoL
            ) -> anyhow::Result<tokio_tungstenite::tungstenite::Message> {
                unimplemented!("not needed for this test")
            }

            async fn logic_thread(
                connection_data: Arc<tokio::sync::Mutex<ConnectionInfoL>>,
                websocket: Arc<WebsocketConnection>,
                _start_heartbeat: tokio::sync::oneshot::Sender<u64>
            ) {
                println!("logic_thread started");
                let last_heartbeat_response = connection_data.lock().await.aditional_data.clone();
                let r = websocket.send(
                    tokio_tungstenite::tungstenite::Message::Text(
                        last_heartbeat_response.to_string()
                    )
                ).await;
                println!("a: {:?}", r);

                while let Ok(m) = websocket.reader().await.lock().await.next().await.unwrap() {
                    println!("{:?}", m);
                    if m.is_text() && m.to_text().unwrap() == last_heartbeat_response.to_string() {
                        println!("Received message");
                        break;
                    }
                }
            }
        }
        let websocket = TestWebsocket {};
        let (return_channel, _) = tokio::sync::mpsc::channel::<()>(5);

        let runtime = tokio::runtime::Runtime::new().unwrap();

        runtime.block_on(async {
            let result = websocket.start_websocket(
                String::from(0),
                return_channel,
                ECHO_SERVER.to_string()
            ).await;

            assert!(result.is_ok());
        });
    }
}

pub trait Websocket: WebsocketThreads<ConnectionInfo<Self::ConnectionData, Self::MessageType>> {
    type ConnectionData;
    type MessageType;
    type ConnectionInfo;
    async fn start_websocket(
        &self,
        connection_data: Self::ConnectionData,
        return_channel: tokio::sync::mpsc::Sender<Self::MessageType>,
        connection_url: String
    ) -> anyhow::Result<()>;
    async fn heartbeat_thread(
        connection_info: Arc<tokio::sync::Mutex<Self::ConnectionInfo>>,
        websocket: Arc<WebsocketConnection>,
        start: tokio::sync::oneshot::Receiver<u64>
    ) -> anyhow::Result<()>;
    fn stop(&self);
    fn send_request(&self, message: Self::MessageType) -> anyhow::Result<()>;
}
pub trait WebsocketMessage: Sized {
    fn heartbeat() -> Option<Self>;
    fn heartbeat_ack() -> Option<Self>;
}
