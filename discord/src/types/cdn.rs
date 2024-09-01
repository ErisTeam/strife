//! TODO
//! https://docs.discord.sex/reference#cdn-formatting



use std::fmt::Display;
use serde::{Serialize, Deserialize};
use thiserror::Error;



#[derive(Debug, Clone, PartialEq, Eq, Error)]
pub enum ParseIconHashError {
    /// Icon hash length is invalid. Expected 32 characters (not including the animated prefix `a_`).
    #[error("Icon hash length is invalid. Expected `{}` characters (not including the animated prefix `a_`), got `{0}`.", CdnHash::SIZE * 2)]
    InvalidHashLength(usize),

    /// Unable to decode the icon hash.
    #[error("Unable to decode the icon hash. {0}")]
    InvalidHash(#[from] base16::DecodeError),
}



#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct CdnHash {
    hash: [u8; Self::SIZE],
    animated: bool,
}

impl CdnHash {
    // Size of the base16 hash
    pub const SIZE: usize = 16;

    pub fn new(animated: bool, hash: [u8; Self::SIZE]) -> Self {
        Self {
            hash,
            animated,
        }
    }

    pub fn is_animated(&self) -> bool {
        self.animated
    }

    pub fn get_hash(&self) -> &[u8; Self::SIZE] {
        &self.hash
    }
}

impl Display for CdnHash {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if self.animated {
            write!(f, "a_")?;
        }

        write!(f, "{}", base16::encode_lower(&self.hash))
    }
}

impl TryFrom<&str> for CdnHash {
    type Error = ParseIconHashError;
    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let mut hash = [0; Self::SIZE];
        let animated = value.starts_with("a_");

        let mut hash_str_start = 0;
        if animated {
            hash_str_start = 2;
        }

        let hash_str = value.get(hash_str_start..(Self::SIZE+1)*2).ok_or(ParseIconHashError::InvalidHashLength(value.len() - hash_str_start))?;

        base16::decode_slice(&hash_str, &mut hash).map_err(ParseIconHashError::InvalidHash)?;

        Ok(Self {
            hash,
            animated,
        })
    }
}

impl TryFrom<String> for CdnHash {
    type Error = ParseIconHashError;
    fn try_from(value: String) -> Result<Self, Self::Error> {
        Self::try_from(value.as_str())
    }
}

impl<'de> Deserialize<'de> for CdnHash {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where D: serde::Deserializer<'de> {
        let icon_hash_str: &str = Deserialize::deserialize(deserializer)?;
        CdnHash::try_from(icon_hash_str).map_err(serde::de::Error::custom)
    }
}

impl Serialize for CdnHash {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where S: serde::Serializer {
        serializer.serialize_str(&self.to_string())
    }
}



#[cfg(test)]
mod tests {
    use super::*;
    const TEST_ICON_HASH_STR: &'static str = "a_1269e74af4df7417b13759eae50c83dc";

    #[test]
    fn from_string() {
        let icon_hash = CdnHash::try_from(TEST_ICON_HASH_STR).expect("Should be a valid icon hash.");

        assert!(icon_hash.is_animated());
        assert_eq!(icon_hash.get_hash(), &[18, 105, 231, 74, 244, 223, 116, 23, 177, 55, 89, 234, 229, 12, 131, 220]);
    }

    #[test]
    fn to_string() {
        let icon_hash = CdnHash::try_from(TEST_ICON_HASH_STR).expect("Should be a valid icon hash.");

        assert_eq!(&icon_hash.to_string(), TEST_ICON_HASH_STR);
    }
}
