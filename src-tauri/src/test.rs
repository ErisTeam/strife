use crate::main_app_state::MainState;

use std::{fs, path::Path};

pub fn add_token(m: &MainState, handle: tauri::AppHandle) {
    let PATH = handle
        .path_resolver()
        .app_data_dir()
        .unwrap()
        .into_os_string()
        .into_string();
    let path = Path::new(&PATH.unwrap()).join("token.json");

    println!("Looking for token file at {}", path.display());
    if !path.exists() {
        println!("Failed to find token file");
        return;
    }
    let file = fs::File::open(path).unwrap();
    #[derive(serde::Deserialize)]
    struct Token {
        token: String,
        id: String,
    }
    let token: Token = serde_json::from_reader(file).unwrap();
    println!("token Found {}", token.id);
    m.add_new_user(token.id, token.token);
}
