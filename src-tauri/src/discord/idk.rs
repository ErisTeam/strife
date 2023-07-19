//TODO: change name of file

use crate::discord::types::{ channel::Channel, relationship::Relationship };
pub async fn get_channel(id: String, token: String) -> Result<Channel, reqwest::Error> {
	use reqwest::Client;
	use crate::discord::constants::GET_CHANNEL;
	let client = Client::new();
	let res = client.get(format!("{}{}", GET_CHANNEL, id)).header("Authorization", token).send().await?;
	res.json::<Channel>().await
}
pub async fn get_avatar(id: String, hash: String) -> Result<Vec<u8>, reqwest::Error> {
	let resp = reqwest::get(format!("https://cdn.discordapp.com/avatars/{}/{}.webp?size=128", id, hash)).await;
	if let Ok(resp) = resp {
		let b = resp.bytes().await?;
		Ok(b.to_vec())
	} else {
		Err(resp.err().unwrap())
	}
}

pub async fn get_relationships(token: String) -> Result<Vec<Relationship>, reqwest::Error> {
	use reqwest::Client;
	use crate::discord::constants::GET_RELATIONSHIPS;
	let client = Client::new();
	let res = client.get(GET_RELATIONSHIPS).header("Authorization", token).send().await?;
	let relationships = res.json::<Vec<Relationship>>().await?;
	println!("{:?}", relationships);
	Ok(relationships)
}
