use serde::{ Deserialize, Serialize };

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum MobileAuth {
    #[serde(rename = "qrcode")] Qrcode {
        qrcode: String,
    },
    #[serde(rename = "ticketData")] TicketData {
        #[serde(rename = "userId")]
        user_id: String,
        discriminator: String,
        #[serde(rename = "avatarHash")]
        avatar_hash: String,
        username: String,
    },
}