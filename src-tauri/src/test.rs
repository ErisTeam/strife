use std::{ fs, path::Path };

use crate::main_app_state::MainState;

const PATH: &str = "../../token.json";

pub fn add_token(m: &MainState) {
	let path = Path::new(PATH);
	if !path.exists() {
		return;
	}
	let file = fs::File::open(path).unwrap();
	#[derive(serde::Deserialize)]
	struct Token {
		token: String,
		id: String,
	}
	let token: Token = serde_json::from_reader(file).unwrap();
	m.add_new_user(token.id, token.token);
}