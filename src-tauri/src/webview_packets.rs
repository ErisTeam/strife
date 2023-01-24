// Serde stuff, if you need more info you can check it
// out here: <https://serde.rs/enum-representations.html>.
//
// It's used here to make matching easier.
use serde::{ Deserialize, Serialize };


/// # Information
/// `MobileAuth` is used for sending data associated with <br>
/// QR code authentication between Rust and React.
/// 
/// # More Information
/// `MobileAuth` may be of type: <br>
/// - `Qrcode` <br>
/// - `TicketData` <br>
/// - `LoginSuccess` <br>
/// - `LoginError` <br>
#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum MobileAuth {
    /// # Information
    /// Contains a String with the QR code.
    #[serde(rename = "qrcode")]
    Qrcode {
        qrcode: String,
    },

    /// # Information
    /// Used for sending user login data .
    #[serde(rename = "ticketData")]
    TicketData {
        #[serde(rename = "userId")]
        user_id: String,
        discriminator: String,
        #[serde(rename = "avatarHash")]
        avatar_hash: String,
        username: String,
    },

    /// # Information
    /// TODO
    #[serde(rename = "loginSuccess")]
    LoginSuccess {},

    /// # Information
    /// Contains an error message if anything went wrong.
    #[serde(rename = "loginError")]
    LoginError {
        error: String,
    },
}

/// # Information
/// TODO
#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum Gateway {}