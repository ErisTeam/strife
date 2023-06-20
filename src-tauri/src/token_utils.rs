use base64::Engine;

pub fn get_id(token: &str) -> String {
	// let token = token.to_string().clone();
	let fragment = token.split(".").collect::<Vec<&str>>()[0];
	println!("{}", fragment);
	let decoded = base64::engine::general_purpose::STANDARD.decode(fragment).unwrap();
	let id = String::from_utf8(decoded).unwrap();
	println!("id: {}", id);
	id
}
