use std::{ sync::{ Arc, Mutex }, collections::HashMap };

use tauri::{ AppHandle, Manager };
use tokio::sync::mpsc;
use websocket::OwnedMessage;

use crate::{
    main_app_state::MainState,
    modules::mobile_auth_gateway_handler::MobileAuthHandler,
    webview_packets,
};

/// # Information
/// TODO
#[derive(Debug)]
pub enum Modules {
    MobileAuth,
    Gateway,
}

/// # Information
/// TODO
#[derive(Debug)]
pub enum Messages {
    Close {
        what: Modules,
    },
    Start {
        what: Modules,
    },
}

/// # Information
/// TODO
#[derive(Debug)]
pub struct ThreadManager {
    state: Arc<MainState>, 

    mobile_auth_sender: Option<Mutex<mpsc::Sender<OwnedMessage>>>,

    senders: HashMap<Modules, mpsc::Sender<OwnedMessage>>,

    reciver: mpsc::Receiver<Messages>,
}

impl ThreadManager {
    pub fn new(state: Arc<MainState>, reciver: mpsc::Receiver<Messages>) -> Self {
        Self { state, mobile_auth_sender: None, reciver, senders: HashMap::new() }
    }
    pub fn start_mobile_auth(&mut self, handle: AppHandle) {
        println!("Starting mobile auth");
        let mut gate = MobileAuthHandler::new(self.state.clone());
        let (async_proc_input_tx, async_proc_input_rx) = mpsc::channel(32);
        let (async_proc_output_tx, mut async_proc_output_rx) =
            mpsc::channel::<webview_packets::MobileAuth>(32);

            // TODO: Make this a function
        tauri::async_runtime::spawn(async move {
            loop {
                if let Some(output) = async_proc_output_rx.recv().await {
                    println!("mobile auth event listener recived: {:?}", output);
                    handle.emit_all("mobileAuth", serde_json::to_string(&output).unwrap()).unwrap();
                } else {
                    println!("mobile auth event listener closing");
                    break;
                }
            }
        });
        self.mobile_auth_sender = Some(Mutex::new(async_proc_input_tx));
        tauri::async_runtime::spawn(async move {
            gate.generate_keys();
            gate.run(async_proc_input_rx, async_proc_output_tx).await;
        });
    }
    pub async fn run(&mut self, handle: AppHandle) {
        loop {
            println!("waiting for message");
            if let Some(msg) = self.reciver.recv().await {
                match msg {
                    Messages::Start { what } =>
                        match what {
                            Modules::MobileAuth => {
                                if
                                    self.mobile_auth_sender.is_none() ||
                                    self.mobile_auth_sender
                                        .as_ref()
                                        .unwrap()
                                        .lock()
                                        .unwrap()
                                        .is_closed()
                                {
                                    self.start_mobile_auth(handle.clone());
                                }
                            }
                            Modules::Gateway => {
                                todo!("start gateway");
                            }
                        }
                    Messages::Close { what } =>
                        match what {
                            Modules::MobileAuth => {
                                if let Some(sender) = self.mobile_auth_sender.take() {
                                    //sender.lock().unwrap().send();
                                    todo!("close mobile auth");
                                }
                            }
                            Modules::Gateway => {
                                todo!("close gateway");
                            }
                        }
                }
            } else {
                println!("Closing HOW? Also gami is a furry!");
                break;
            }
        }
    }
}