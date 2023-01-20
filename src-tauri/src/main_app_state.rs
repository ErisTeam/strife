use std::{ sync::Mutex, collections::HashMap };

use tokio::sync::mpsc;

use crate::manager::Messages;

#[derive(Debug, PartialEq)]
pub enum State {
    LoginScreen {
        qr_url: String,
    },
}

#[derive(Debug)]
pub struct MainState {
    #[deprecated(note = "please use `tokens` instead")]
    pub tokens_old: Mutex<Vec<String>>,

    pub tokens: Mutex<HashMap<String, String>>,

    sender: Mutex<mpsc::Sender<Messages>>,

    pub state: Mutex<State>,
}
impl MainState {
    pub fn new(sender: Mutex<mpsc::Sender<Messages>>) -> Self {
        Self {
            tokens_old: Mutex::new(vec![]),
            tokens: Mutex::new(HashMap::new()),
            sender,
            state: Mutex::new(State::LoginScreen { qr_url: String::new() }),
        }
    }
    pub fn is_logged_in(&self) -> bool {
        self.tokens.lock().unwrap().len() > 0
    }
    pub fn send(&self, msg: Messages) {
        println!("sending: {:?}", msg);
        let state = self.state.lock().unwrap();
        match &*state {
            State::LoginScreen { .. } => {
                //if qr_url.is_empty() {
                self.sender.lock().unwrap().blocking_send(msg).unwrap();
                //todo return
                //}
                //todo return
            }
        }
    }
}