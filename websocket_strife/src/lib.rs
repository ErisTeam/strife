#[allow(unused)]
use std::{ fmt::Debug, sync::{ Arc, Mutex, RwLock } };

use fastwebsockets::{ FragmentCollector, Frame, Payload, WebSocket };
use log::{ debug, error, trace };
use tokio::io::{ AsyncRead, AsyncWrite };
use std::{ future::Future, pin::Pin };

use fastwebsockets::handshake;
use http_body_util::Empty;
use hyper::{ header::{ CONNECTION, UPGRADE }, Request };
use tokio::net::TcpStream;
use tokio_rustls::{ rustls::{ pki_types::ServerName, ClientConfig }, TlsConnector };

struct SpawnExecutor;

impl<Fut> hyper::rt::Executor<Fut>
    for SpawnExecutor
    where Fut: Future + Send + 'static, Fut::Output: Send + 'static
{
    fn execute(&self, fut: Fut) {
        tokio::task::spawn(fut);
    }
}

fn tls_connector() -> anyhow::Result<TlsConnector> {
    let root_store = tokio_rustls::rustls::RootCertStore {
        roots: webpki_roots::TLS_SERVER_ROOTS.iter().cloned().collect(),
    };

    let config = ClientConfig::builder().with_root_certificates(root_store).with_no_client_auth();

    Ok(TlsConnector::from(Arc::new(config)))
}

pub trait WebsocketStream: AsyncRead + AsyncWrite + Unpin + Debug {}
impl<T> WebsocketStream for T where T: AsyncRead + AsyncWrite + Unpin + Debug {}

#[derive(Debug, Clone)]
pub enum WebsocketMessage {
    Text(String),
    Binary(Vec<u8>),
    Close,
    Restart,
    /// Ignored when send from message sender
    Resume,
    /// Ignored when send from message sender
    Start,
}

pub enum RestartResult<T: WebsocketStream> {
    Restart(WebSocket<T>),
    Close,
}

impl<'a, T: WebsocketStream + 'a> RestartResult<T> {
    pub fn to_websocket_stream(ws: WebSocket<T>) -> RestartResult<Box<dyn WebsocketStream + 'a>> {
        let a = ws.into_inner();
        let ws: WebSocket<Box<dyn WebsocketStream>> = fastwebsockets::WebSocket::after_handshake(
            Box::new(a),
            fastwebsockets::Role::Client
        );
        RestartResult::Restart(ws)
    }
}

pub struct Connection {
    pub sender: Arc<tokio::sync::broadcast::Sender<WebsocketMessage>>,

    message_sender: tokio::sync::mpsc::Sender<WebsocketMessage>,
    message_receiver: Mutex<Option<tokio::sync::mpsc::Receiver<WebsocketMessage>>>,
    restart_handler: RwLock<
        Box<
            dyn (Fn(
                String
            ) -> Pin<Box<dyn Future<Output = RestartResult<Box<dyn WebsocketStream>>>>>) +
                Send +
                Sync +
                'static
        >
    >,
}
impl Connection {
    pub fn new() -> Arc<Self> {
        let (sender, _) = tokio::sync::broadcast::channel(10);
        let (message_sender, message_receiver) = tokio::sync::mpsc::channel(10);

        let restart_handler: RwLock<
            Box<
                dyn (Fn(
                    String
                ) -> Pin<Box<dyn Future<Output = RestartResult<Box<dyn WebsocketStream>>>>>) +
                    Send +
                    Sync
            >
        > = RwLock::new(Box::new(|_reason: String| Box::pin(async { RestartResult::Close })));

        Arc::new(Self {
            sender: Arc::new(sender),
            message_receiver: Mutex::new(Some(message_receiver)),
            message_sender,
            restart_handler,
        })
    }
    pub fn set_restart_handler<T>(&self, new_handler: T)
        where
            T: Fn(
                String
            ) -> Pin<Box<dyn Future<Output = RestartResult<Box<dyn WebsocketStream>>>>> +
                Send +
                Sync +
                'static
    {
        let b = Box::new(new_handler);
        let mut handler = self.restart_handler.write().unwrap();
        *handler = b;
    }
    pub fn reader(&self) -> tokio::sync::broadcast::Receiver<WebsocketMessage> {
        self.sender.subscribe()
    }
    pub fn restart(&self) -> anyhow::Result<()> {
        self.sender.send(WebsocketMessage::Restart)?;
        Ok(())
    }
    pub fn close(&self) -> anyhow::Result<()> {
        self.sender.send(WebsocketMessage::Close)?;
        Ok(())
    }

    pub async fn send_message(
        &self,
        message: WebsocketMessage
    ) -> anyhow::Result<(), tokio::sync::mpsc::error::SendError<WebsocketMessage>> {
        trace!("Sending Message {:?}", message);
        self.message_sender.send(message).await
    }

    pub async fn create_websocket_url(
        url: &str,
        headers: Vec<(String, String)>
    ) -> anyhow::Result<
        (
            WebSocket<hyper_util::rt::TokioIo<hyper::upgrade::Upgraded>>,
            hyper::Response<hyper::body::Incoming>,
        )
    > {
        let url = String::from(url);
        let secure = if &url[..6] == "wss://" {
            true
        } else if &url[..5] == "ws://" {
            false
        } else {
            return Err(anyhow::anyhow!("{} is not ws or wss", &url[..3]));
        };

        let domain_string = if secure { url[6..].to_string() } else { url[5..].to_string() };

        let port = if secure { 443 } else { 80 };
        let stream = TcpStream::connect(format!("{}:{}", domain_string, port)).await?;
        debug!("TCP Stream created");

        let tls_connector = tls_connector()?;
        debug!("TLS Connector Created");
        let domain = ServerName::try_from(domain_string.clone()).map_err(|_| {
            std::io::Error::new(std::io::ErrorKind::InvalidInput, "invalid dnsname")
        })?;

        let tls_stream = tls_connector.connect(domain, stream).await?;
        println!("streamCreated 2");
        let mut req = Request::builder()
            .method("GET")
            .uri(url)
            .header("Host", domain_string)
            .header(UPGRADE, "websocket")
            .header(CONNECTION, "upgrade")
            .header("Sec-WebSocket-Key", fastwebsockets::handshake::generate_key())
            .header("Sec-WebSocket-Version", "13");
        for (key,value) in headers {
            req = req.header(key, value);
        }

        let req = req.body(Empty::<hyper::body::Bytes>::new())?;
        Ok(handshake::client(&SpawnExecutor, req, tls_stream).await?)
    }

    pub async fn start_url(&self, url: &str) -> anyhow::Result<()> {
        let (ws, response) = Self::create_websocket_url(url,Vec::new()).await?;
        if response.status().as_u16() != 101 {
            debug!("status code: {}", response.status());
            todo!("Return Error");
        }
        self.start_existing(ws).await
    }

    pub async fn start_existing<S: AsyncRead + AsyncWrite + Unpin + Debug>(
        &self,
        websocket: WebSocket<S>
    ) -> anyhow::Result<()> {
        let sender = &self.sender.clone();
        let res = (async {
            let mut running = true;
            let mut receiver = sender.subscribe();
            let mut message_receiver = self.message_receiver.lock().unwrap().take().unwrap();

            let mut ws = {
                let websocket: WebSocket<
                    Box<dyn WebsocketStream>
                > = fastwebsockets::WebSocket::after_handshake(
                    Box::new(websocket.into_inner()),
                    fastwebsockets::Role::Client
                );
                FragmentCollector::new(websocket)
            };

            sender.send(WebsocketMessage::Start)?;
            while running {
                let r: anyhow::Result<()> = tokio::select! {
                message = ws.read_frame() => {
                    if let Ok(message) = message {
                        
                       match message.opcode {
                           fastwebsockets::OpCode::Text => {
                            let payload = message.payload.to_vec();
                            let string = std::str::from_utf8(&payload)?;
                            sender.send(WebsocketMessage::Text(string.to_string()))?;
                           },
                           fastwebsockets::OpCode::Binary => todo!(),
                           fastwebsockets::OpCode::Close => {
                            let payload = message.payload.to_vec();
                            
                            let string = std::str::from_utf8(&payload)?;
                            debug!("Closing websocket connection {}",string);

                            sender.send(WebsocketMessage::Restart)?;
                            //TODO: move to closure
                            let restart_handler = self.restart_handler.read().unwrap();
                            let res = (restart_handler)(string.to_string()).await;
                            if let RestartResult::Restart(new_ws) = res{
                                ws = FragmentCollector::new(new_ws);
                                sender.send(WebsocketMessage::Resume)?;
                            }else{
                                sender.send(WebsocketMessage::Close)?;
                            }
                        },
                        _=>{}
                       }
                    }
                    Ok(())
                }
                m = receiver.recv() => {
                    match m {
                        Ok(WebsocketMessage::Close) => {
                            running = false;
                        }
                        Ok(WebsocketMessage::Restart) => {
                            //TODO: move to closure
                            let restart_handler = self.restart_handler.read().unwrap();

                            let res = (restart_handler)("?".to_string()).await;
                            if let RestartResult::Restart(new_ws) = res{
                                ws = FragmentCollector::new(new_ws);
                                sender.send(WebsocketMessage::Resume)?;
                            }else{
                                sender.send(WebsocketMessage::Close)?;
                                
                            }
                        }
                        Err(e) => {
                            println!("Error: {:?}", e);
                            running = false;
                            sender.send(WebsocketMessage::Close)?;
                        }
                        _=> {}
                    }
                    Ok(())
                }
                message = message_receiver.recv()=>{
                    let message = message.unwrap();
                    match message{
                        WebsocketMessage::Text(payload) => {ws.write_frame(Frame::text(Payload::Owned(payload.into_bytes()))).await?;},
                        WebsocketMessage::Binary(payload) => {
                            ws.write_frame(Frame::binary(Payload::Owned(payload))).await?;
                        },
                        WebsocketMessage::Close => {
                            sender.send(WebsocketMessage::Close)?;
                        },
                        WebsocketMessage::Restart => todo!(),
                        _=>{}
                    }
                    Ok(())
                }
            };
                if r.is_err() {
                    let err = self.close();
                    if let Err(err) = err {
                        error!("error while sending close message {}", err);
                    }
                    return r;
                }
            }
            Ok(())
        }).await;
        if res.is_err() {
            let _res = self.close();
        }
        return res;
    }

    pub async fn start<S: AsyncRead + AsyncWrite + Unpin + Debug>(
        &self,
        stream: S
    ) -> anyhow::Result<()> {
        let ws = fastwebsockets::WebSocket::after_handshake(stream, fastwebsockets::Role::Client);
        self.start_existing(ws).await
    }
}
impl Drop for Connection {
    fn drop(&mut self) {
        let _result = self.sender.send(WebsocketMessage::Close);
    }
}
impl Debug for Connection {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Connection")
            .field("sender", &self.sender)
            .field("message_sender", &self.message_sender)
            .field("message_receiver", &self.message_receiver)
            .finish()
    }
}
