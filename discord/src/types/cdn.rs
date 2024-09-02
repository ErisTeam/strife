//! TODO
//! https://docs.discord.sex/reference#cdn-formatting



use std::fmt::Display;
use serde::{Serialize, Deserialize};
use base64::prelude::*;
use thiserror::Error;



#[derive(Debug, Clone, PartialEq, Eq, Error)]
pub enum ParseIconHashError {
    /// Icon hash length is invalid. Expected 32 characters (not including the animated prefix `a_`).
    #[error("Icon hash length is invalid. Expected `{}` characters (not including the animated prefix `a_`), got `{0}`.", Hash::SIZE * 2)]
    InvalidHashLength(usize),

    /// Unable to decode the icon hash.
    #[error("Unable to decode the icon hash. {0}")]
    InvalidHash(#[from] base16::DecodeError),
}



#[derive(Debug, Default, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Hash {
    hash: [u8; Self::SIZE],
    animated: bool,
}

impl Hash {
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

impl Display for Hash {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if self.animated {
            write!(f, "a_")?;
        }

        write!(f, "{}", base16::encode_lower(&self.hash))
    }
}

impl TryFrom<&str> for Hash {
    type Error = ParseIconHashError;
    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let mut hash = [0; Self::SIZE];
        let animated = value.starts_with("a_");

        let mut hash_str_start = 0;
        if animated {
            hash_str_start = 2;
        }

        let hash_len = value.len() - hash_str_start;
        if value.len() - hash_str_start != 32 {
            return Err(ParseIconHashError::InvalidHashLength(hash_len))
        }

        let hash_str = value.get(hash_str_start..(Self::SIZE+1)*2).unwrap();

        base16::decode_slice(&hash_str, &mut hash).map_err(ParseIconHashError::InvalidHash)?;

        Ok(Self {
            hash,
            animated,
        })
    }
}

impl TryFrom<String> for Hash {
    type Error = ParseIconHashError;
    fn try_from(value: String) -> Result<Self, Self::Error> {
        Self::try_from(value.as_str())
    }
}

impl<'de> Deserialize<'de> for Hash {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where D: serde::Deserializer<'de> {
        let icon_hash_str: &str = Deserialize::deserialize(deserializer)?;
        Hash::try_from(icon_hash_str).map_err(serde::de::Error::custom)
    }
}

impl Serialize for Hash {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where S: serde::Serializer {
        serializer.serialize_str(&self.to_string())
    }
}




#[derive(Debug, Clone, PartialEq, Eq, Error)]
pub enum ParseDataError {
    /// The URI should begin with a scheme. The only one accepted for [`Data`] is `data`.
    #[error("The URI should begin with a scheme. The only one accepted for [`Data`] is `data`.")]
    MissingScheme,

    /// Expected `:` after the scheme definition.
    #[error("Expected `:` after the scheme definition.")]
    MissingColon,

    /// Expected at least one `;` to indicate media type's end.
    #[error("Expected at least one `;` to indicate media type's end.")]
    MissingSemicolon,

    /// Expected `,` to indicate start of the data.
    #[error("Expected `,` to indicate start of the data.")]
    MissingComma,

    /// Expected `base64` extension after the media type.
    #[error("Expected `base64` extension after the media type.")]
    MissingExtension,

    #[error("{0}")]
    InvalidDataType(#[from] ParseDataTypeError),

    #[error("{0}")]
    InvalidData(#[from] base64::DecodeError),
}

/// https://en.wikipedia.org/wiki/Data_URI_scheme
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Data {
    r#type: DataType,
    data: Vec<u8>,
}

impl Display for Data {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // Uses standard base64 character set rather than the URL-safe one
        // https://en.wikipedia.org/wiki/Data_URI_scheme
        write!(f, "data:{};base64,{}", self.r#type, BASE64_STANDARD.encode(&self.data))
    }
}

impl TryFrom<&str> for Data {
    type Error = ParseDataError;
    fn try_from(value: &str) -> Result<Self, Self::Error> {
        if !value.starts_with("data") {
            return Err(ParseDataError::MissingScheme);
        }

        // No need to use find, as the only accepted scheme is `data`, so the colon must be at
        // index 4
        value.chars().nth(4).ok_or(ParseDataError::MissingColon)?;

        let data_type_end = value.find(';').ok_or(ParseDataError::MissingSemicolon)?;
        let data_type = DataType::try_from(value
            .get("data:".len()..data_type_end)
            .ok_or(ParseDataError::MissingSemicolon)?
        )?;

        let comma_delimiter = value.rfind(',').ok_or(ParseDataError::MissingComma)?;
        if !value.get(data_type_end+1..comma_delimiter).ok_or(ParseDataError::MissingExtension)?.contains("base64") {
            return Err(ParseDataError::MissingExtension);
        };

        let data_string = value.get(comma_delimiter+1..);
        let data = match data_string {
            Some(data_string) => BASE64_STANDARD.decode(data_string)?,
            None => Vec::default(),
        };

        Ok(Data {
            r#type: data_type,
            data,
        })
    }
}

impl TryFrom<String> for Data {
    type Error = ParseDataError;
    fn try_from(value: String) -> Result<Self, Self::Error> {
        Self::try_from(value.as_str())
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Error)]
pub enum ParseDataTypeError {
    /// Invalid data type, expected one of `image/jpeg`, `image/png`, `image/gif`.
    #[error("Invalid data type, expected one of `image/jpeg`, `image/png`, `image/gif`, found `{0}`.")]
    InvalidDataType(String),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum DataType {
    JPEG,
    PNG,
    GIF,
}

impl Display for DataType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::JPEG => write!(f, "image/jpeg"),
            Self::PNG => write!(f, "image/png"),
            Self::GIF => write!(f, "image/gif"),
        }
    }
}

impl TryFrom<&str> for DataType {
    type Error = ParseDataTypeError;
    fn try_from(value: &str) -> Result<Self, Self::Error> {
        Ok(match value {
            "image/jpeg" => Self::JPEG,
            "image/png" => Self::PNG,
            "image/gif" => Self::GIF,
            _ => { return Err(ParseDataTypeError::InvalidDataType(value.to_string())); },
        })
    }
}

impl TryFrom<String> for DataType {
    type Error = ParseDataTypeError;
    fn try_from(value: String) -> Result<Self, Self::Error> {
        Self::try_from(value.as_str())
    }
}

impl<'de> Deserialize<'de> for DataType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where D: serde::Deserializer<'de> {
        let data_type: &str = Deserialize::deserialize(deserializer)?;
        DataType::try_from(data_type).map_err(serde::de::Error::custom)
    }
}

impl Serialize for DataType {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where S: serde::Serializer {
        serializer.serialize_str(&self.to_string())
    }
}



#[cfg(test)]
mod tests {
    mod hash {
        use super::super::{Hash, ParseIconHashError};
        const TEST_ICON_HASH_STR: &'static str = "a_1269e74af4df7417b13759eae50c83dc";

        #[test]
        fn to_string() {
            let icon_hash = Hash::try_from(TEST_ICON_HASH_STR).expect("Should be a valid icon hash.");

            assert_eq!(&icon_hash.to_string(), TEST_ICON_HASH_STR);
        }

        #[test]
        fn from_string() {
            let icon_hash = Hash::try_from(TEST_ICON_HASH_STR).expect("Should be a valid icon hash.");

            assert!(icon_hash.is_animated());
            assert_eq!(icon_hash.get_hash(), &[18, 105, 231, 74, 244, 223, 116, 23, 177, 55, 89, 234, 229, 12, 131, 220]);

            assert_eq!(Hash::try_from("b_1269e74af4df7417b13759eae50c83dc"), Err(ParseIconHashError::InvalidHashLength(34)));
            assert_eq!(Hash::try_from("a_1269e74af4df7417b13759eae5"), Err(ParseIconHashError::InvalidHashLength(26)));
            assert_eq!(Hash::try_from("a_1269e7uaf4df7417b13759eae50c83dc"), Err(ParseIconHashError::InvalidHash(base16::DecodeError::InvalidByte { index: 6, byte: 117 })));
        }
    }

    mod data {
        use super::super::{DataType, Data, ParseDataError, ParseDataTypeError};

        #[test]
        fn data_type_to_string() {
            assert_eq!(DataType::JPEG.to_string(), "image/jpeg");
            assert_eq!(DataType::PNG.to_string(), "image/png");
            assert_eq!(DataType::GIF.to_string(), "image/gif");
        }

        #[test]
        fn data_type_from_string() {
            assert_eq!(DataType::try_from("image/jpeg").expect("Should be a valid `DataType`"), DataType::JPEG);
            assert_eq!(DataType::try_from("image/png").expect("Should be a valid `DataType`"), DataType::PNG);
            assert_eq!(DataType::try_from("image/gif").expect("Should be a valid `DataType`"), DataType::GIF);

            DataType::try_from("image/g").expect_err("Should be an invalid `DataType`");
        }

        #[test]
        fn data_to_string() {
            let data = Data {
                r#type: DataType::PNG,
                data: vec![12, 94, 65, 128],
            };

            assert_eq!(data.to_string(), "data:image/png;base64,DF5BgA==");
        }

        #[test]
        fn data_from_string() {
            let data = Data {
                r#type: DataType::PNG,
                data: vec![12, 94, 65, 128],
            };

            assert_eq!(data, Data::try_from("data:image/png;base64,DF5BgA==").expect("Should be a valid `Data`"));
            assert_eq!(Data { r#type: DataType::PNG, data: Vec::default() }, Data::try_from("data:image/png;base64,").expect("Should be a valid `Data`"));

            assert_eq!(Data::try_from(""), Err(ParseDataError::MissingScheme));
            assert_eq!(Data::try_from("dati"), Err(ParseDataError::MissingScheme));
            assert_eq!(Data::try_from("data"), Err(ParseDataError::MissingColon));
            assert_eq!(Data::try_from("data:"), Err(ParseDataError::MissingSemicolon));
            assert_eq!(Data::try_from("data:base64;"), Err(ParseDataError::InvalidDataType(ParseDataTypeError::InvalidDataType("base64".to_string()))));
            assert_eq!(Data::try_from("data:image/png,base64;"), Err(ParseDataError::InvalidDataType(ParseDataTypeError::InvalidDataType("image/png,base64".to_string()))));
            assert_eq!(Data::try_from("data:image/png;"), Err(ParseDataError::MissingComma));
            assert_eq!(Data::try_from("data:image/png;,"), Err(ParseDataError::MissingExtension));
            assert_eq!(Data::try_from("data:image/png;base,"), Err(ParseDataError::MissingExtension));

            assert_eq!(Data::try_from("data:image/png;base64,==DF5BgA"), Err(ParseDataError::InvalidData(base64::DecodeError::InvalidByte(0, 61))));
            assert_eq!(Data::try_from("data:image/png;base64,DF5BgA"), Err(ParseDataError::InvalidData(base64::DecodeError::InvalidPadding)));
        }
    }
}
