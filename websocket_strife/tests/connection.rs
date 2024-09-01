use std::sync::Arc;

use futures::FutureExt;
use tokio::task::JoinHandle;
use websocket_strife::{ Connection, RestartResult, WebsocketMessage };
use test_log::test;

//TODO: Restart Test
#[test(tokio::test)]
async fn restart() -> anyhow::Result<()> {
    let conn = Connection::new();
    let url = "wss://echo.websocket.org";

    let conn_clone = conn.clone();

    let a = Arc::new(tokio::sync::Mutex::new(false));

    let a_clone = a.clone();
    conn.set_restart_handler(move |_reason| {
        let a_clone = a_clone.clone();
        (
            async move {
                let a = a_clone.lock().await;
                println!("{}", a);
                println!("aaaaaaaaaaaaa");

                if !*a {
                    let (ws, _response) = Connection::create_websocket_url(
                        "wss://echo.websocket.org"
                    ).await.unwrap();

                    let ws = RestartResult::to_websocket_stream(ws);
                    return ws;
                }
                return RestartResult::Close;
            }
        ).boxed()
    });
    println!("handler_set");
    let a_clone = a.clone();
    let thread = tokio::spawn(async move {
        let mut reader = conn_clone.reader();

        let mut r = false;
        while let Ok(m) = reader.recv().await {
            println!("received {:?}", m);
            match m {
                WebsocketMessage::Text(t) => {
                    if t == "Gami to furras" {
                        if r {
                            *a_clone.lock().await = true;
                        }
                        conn_clone.sender.send(crate::WebsocketMessage::Restart).unwrap();
                        r = true;
                    }
                }
                WebsocketMessage::Resume | WebsocketMessage::Start => {
                    conn_clone
                        .send_message(
                            crate::WebsocketMessage::Text("Gami to furras".to_string())
                        ).await
                        .unwrap();
                }
                WebsocketMessage::Close => {
                    println!("Exiting");
                    break;
                }
                _ => {}
            }
        }
    });

    conn.start_url(&url).await?;
    thread.await?;
    Ok(())
}

#[test(tokio::test)]
async fn echo() -> anyhow::Result<()> {
    let conn = Connection::new();
    let url = "wss://echo.websocket.org";
    let conn_clone = conn.clone();
    let thread: JoinHandle<anyhow::Result<()>> = tokio::spawn(async move {
        let mut reader = conn_clone.reader();

        conn_clone.send_message(WebsocketMessage::Text("Gami to furras".to_string())).await?;
        while let Ok(m) = reader.recv().await {
            println!("received {:?}", m);
            match m {
                WebsocketMessage::Text(t) => {
                    if t == "Gami to furras" {
                        conn_clone.sender.send(WebsocketMessage::Close)?;
                    }
                }
                WebsocketMessage::Close => {
                    println!("Exiting");
                    break;
                }
                _ => {}
            }
        }
        Ok(())
    });

    conn.start_url(&url).await?;
    thread.await??;
    Ok(())
}

#[test(tokio::test)]
async fn wrong_method() {
    let url = "http://echo.websocket.org";

    let response = Connection::create_websocket_url(url).await;
    assert!(response.is_err());
}
//TODO: heartbeat test
//TODO: not secured test
//TODO: closing
//TODO: test dropping Connection struct
#[test(tokio::test)]
async fn dropping() -> anyhow::Result<()> {
    todo!("implement")
}
//TODO: large binary data test
