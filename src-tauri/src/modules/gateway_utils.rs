use std::{ time::Instant, net::TcpStream };

use websocket::{ native_tls::TlsStream, sync::Client, OwnedMessage };

pub fn send_heartbeat(
    instant: &mut Instant,
    started: bool,
    heartbeat_interval: u64,
    ack_recived: &mut bool,
    client: &mut Client<TlsStream<TcpStream>>,
    func: &dyn Fn() -> Option<String>
) -> Option<bool> {
    if started && instant.elapsed().as_millis() > (heartbeat_interval as u128) {
        if !*ack_recived {
            return Some(false);
        }
        *ack_recived = false;
        *instant = std::time::Instant::now();
        if let Some(heartbeat) = func() {
            let heartbeat = OwnedMessage::Text(heartbeat);
            client.send_message(&heartbeat).unwrap();
            println!("Heartbeat");
        }
    }
    None
}