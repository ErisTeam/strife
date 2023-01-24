use std::{ sync::Mutex, collections::HashMap };

use tokio::sync::mpsc;

use crate::manager::Messages;

#[derive(Debug, PartialEq)]
pub enum State {
    LoginScreen {
        qr_url: String,
    }
}

#[derive(Debug)]
pub struct MainState {
    pub tokens: Mutex<HashMap<String, String>>,
    pub state: Mutex<State>,
    sender: Mutex<mpsc::Sender<Messages>>,
}
impl MainState {
    pub fn new(sender: Mutex<mpsc::Sender<Messages>>) -> Self {
        Self {
            tokens: Mutex::new(HashMap::new()),
            sender,
            state: Mutex::new(State::LoginScreen { qr_url: String::new() }),
        }
    }

    pub fn is_logged_in(&self) -> bool {
        self.tokens.lock().unwrap().len() > 0
    }

    pub fn send(&self, msg: Messages) -> Option<String> {
        println!("sending: {:?}", msg);

        let state = self.state.lock().unwrap();

        match &*state {
            State::LoginScreen { qr_url } => {
                if qr_url.is_empty() {
                    self.sender.lock().unwrap().blocking_send(msg).unwrap();
                } else {
                    return Some(qr_url.clone());
                }
            }
        }
        
        None
    }
}