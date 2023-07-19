use base64::Engine;

pub fn get_id(token: &str) -> crate::Result<String> {
	let fragment = token.split('.').collect::<Vec<&str>>()[0];
	let decoded = base64::engine::general_purpose::STANDARD_NO_PAD.decode(fragment)?;
	let id = String::from_utf8(decoded)?;
	Ok(id)
}
