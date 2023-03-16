use std::fs;

use crate::main_app_state::MainState;

pub fn add_token(m: &MainState) {
	let file = fs::File::open("C:\\Users\\Piotr\\Desktop\\test\\token.json").unwrap();
	#[derive(serde::Deserialize)]
	struct Token {
		token: String,
		id: String,
	}
	let token: Token = serde_json::from_reader(file).unwrap();
	m.add_token(token.token.clone(), token.id.clone());
	m.add_new_user(token.id, token.token);
}