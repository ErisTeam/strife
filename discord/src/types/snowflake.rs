//! Implementation of Discord's [`Snowflake`] based on their [documentation](https://discord.com/developers/docs/reference#snowflakes).
//!
//! # Constants
//! [`DISCORD_EPOCH`] defines the first second of year 2015 in milliseconds
//!
//! There is a constant for each field of the [`Snowflake`] defined as part of it's `impl` block.
//! They describe each field's size in bits, what bit does the field start at (denoting the right-most
//! bit inclusively), a bit mask for ease of extracting the fields, and a max value a field can have.



use core::ops::Deref;
use std::fmt::Display;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize, de::Visitor};
use thiserror::Error;



/// Discord Epoch in milliseconds since the first second of 2015.
const DISCORD_EPOCH: u64 = 1420070400000;



#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize, Error)]
pub enum SnowflakeError {
    /// Provided snowflake timestamp is invalid, as it's before the Discord's Epoch ([`DISCORD_EPOCH`]).
    #[error("Provided snowflake timestamp is invalid, as it's before the Discord's Epoch (`{DISCORD_EPOCH}`).")]
    InvalidTimestamp,

    /// One of [`SnowflakeOverflowError`]s.
    #[error("{0}")]
    Overflow(#[from] SnowflakeOverflowError),
}

/// Indicates that one of [`Snowflake`]'s
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize, Error)]
pub enum SnowflakeOverflowError {
    /// Provided snowflake timestamp overflows the max value of [`Snowflake::TIMESTAMP_MAX`] ([`Snowflake::TIMESTAMP_SIZE`] bits) after shifting it by the Discord's Epoch ([`DISCORD_EPOCH`]).
    #[error("Provided snowflake timestamp overflows the max value of `{}` ({} bits) after shifting it by the Discord's Epoch (`{DISCORD_EPOCH}`).", Snowflake::TIMESTAMP_MAX, Snowflake::TIMESTAMP_SIZE)]
    Timestamp,

    /// Provided snowflake worker id overflows the max value of [`Snowflake::WORKER_ID_MAX`] ([`Snowflake::WORKER_ID_SIZE`] bits).
    #[error("Provided snowflake worker id overflows the max value of `{}` ({} bits).", Snowflake::WORKER_ID_MAX, Snowflake::WORKER_ID_SIZE)]
    WorkerId,

    /// Provided snowflake process id overflows the max value of [`Snowflake::PROCESS_ID_MAX`] ([`Snowflake::PROCESS_ID_SIZE`] bits).
    #[error("Provided snowflake process id overflows the max value of `{}` ({} bits).", Snowflake::PROCESS_ID_MAX, Snowflake::PROCESS_ID_SIZE)]
    ProcessId,

    /// Provided snowflake increment overflows the max value of [`Snowflake::INCREMENT_MAX`] ([`Snowflake::INCREMENT_SIZE`] bits).
    #[error("Provided snowflake increment overflows the max value of `{}` ({} bits).", Snowflake::INCREMENT_MAX, Snowflake::INCREMENT_SIZE)]
    Increment,
}



/// Discord's [`Snowflake`] based on their [documentation](https://discord.com/developers/docs/reference#snowflakes).
///
/// It contains four values in a [`u64`]:
/// - `timestamp`
/// - `worker_id`
/// - `process_id`
/// - `increment`
///
/// There is a constant for each field defined as part of the [`Snowflake`] `impl` block.
/// They describe each field's size in bits, what bit does the field start at (denoting the right-most
/// bit inclusively), a bit mask for ease of extracting the fields, and a max value a field can have.
///
/// # Example
/// ```
/// use crate::discord::types::snowflake::Snowflake;
/// use chrono::DateTime;
///
/// let creation_date = DateTime::from_timestamp_millis(1462015105796).expect("Should be a valid timestamp in milliseconds");
/// let snowflake = Snowflake::new(creation_date, 2, 4, 0).expect("Should be a valid snowflake");
///
/// println!("A snowflake in it's full glory! `{}`", snowflake);
/// println!("Let's see what's inside...");
/// println!("A timestamp... and it's {}!", snowflake.get_timestamp().format("%Y/%m/%d %H:%M"));
/// println!("Ohh! Also some other junk.");
/// ```
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize)]
pub struct Snowflake(u64);

impl Snowflake {
    const TIMESTAMP_SIZE: usize = 42;
    const WORKER_ID_SIZE: usize = 5;
    const PROCESS_ID_SIZE: usize = 5;
    const INCREMENT_SIZE: usize = 12;

    const TIMESTAMP_START: usize = 22;
    const WORKER_ID_START: usize = 17;
    const PROCESS_ID_START: usize = 12;
    const INCREMENT_START: usize = 0;

    const TIMESTAMP_MASK: u64 = 0b1111111111111111111111111111111111111111110000000000000000000000;
    const WORKER_ID_MASK: u64 = 0b1111100000000000000000;
    const PROCESS_ID_MASK: u64 = 0b11111000000000000;
    const INCREMENT_MASK: u64 = 0b111111111111;

    const TIMESTAMP_MAX: u64 = Self::TIMESTAMP_MASK >> Self::TIMESTAMP_START;
    const WORKER_ID_MAX: u64 = Self::WORKER_ID_MASK >> Self::WORKER_ID_START;
    const PROCESS_ID_MAX: u64 = Self::PROCESS_ID_MASK >> Self::PROCESS_ID_START;
    const INCREMENT_MAX: u64 = Self::INCREMENT_MASK >> Self::INCREMENT_START;

    /// Creates a new [`Snowflake`].
    ///
    /// # Errors
    /// Errors if the `timestamp` isn't bigger or equal to [`DISCORD_EPOCH`], or if one of it's
    /// arguments exceeds the maximum field size (you can take a look at them in [`Snowflake`]'s
    /// constants).
    pub const fn new(timestamp: DateTime<Utc>, worker_id: u64, process_id: u64, increment: u64) -> Result<Self, SnowflakeError> {
        let milliseconds = timestamp.timestamp_millis();
        if milliseconds < DISCORD_EPOCH as i64 { return Err(SnowflakeError::InvalidTimestamp) }
        let milliseconds = milliseconds as u64;

        if (milliseconds - DISCORD_EPOCH) > Self::TIMESTAMP_MAX { return Err(SnowflakeError::Overflow(SnowflakeOverflowError::Timestamp)) }
        if worker_id > Self::WORKER_ID_MAX { return Err(SnowflakeError::Overflow(SnowflakeOverflowError::WorkerId)) }
        if process_id > Self::PROCESS_ID_MAX { return Err(SnowflakeError::Overflow(SnowflakeOverflowError::ProcessId)) }
        if increment > Self::INCREMENT_MAX { return Err(SnowflakeError::Overflow(SnowflakeOverflowError::Increment)) }

        Ok(Self(
            ((milliseconds - DISCORD_EPOCH) << Self::TIMESTAMP_START as i64) as u64
            + (worker_id << Self::WORKER_ID_START)
            + (process_id << Self::PROCESS_ID_START)
            + (increment << Self::INCREMENT_START)
        ))

    }

    // TODO: Mark as `const` once Options' `unwrap` gets stabilized
    pub fn get_timestamp(&self) -> DateTime<Utc> {
        DateTime::from_timestamp_millis(((self.0 >> Self::TIMESTAMP_START) + DISCORD_EPOCH) as i64).unwrap()
    }

    /// Errors if the `timestamp` isn't bigger or equal to [`DISCORD_EPOCH`], or if it exceeds
    /// the maximum field size of [`Snowflake::TIMESTAMP_MAX`] ([`Snowflake::TIMESTAMP_SIZE`] bits).
    pub fn set_timestamp(&mut self, timestamp: DateTime<Utc>) -> Result<(), SnowflakeError> {
        let milliseconds = timestamp.timestamp_millis();
        if milliseconds < DISCORD_EPOCH as i64 { return Err(SnowflakeError::InvalidTimestamp) }
        let milliseconds = milliseconds as u64;

        if (milliseconds - DISCORD_EPOCH) > Self::TIMESTAMP_MAX { return Err(SnowflakeError::Overflow(SnowflakeOverflowError::Timestamp)); }

        let discord_epoch_timestamp = Self::TIMESTAMP_MASK & ((milliseconds - DISCORD_EPOCH) << Self::TIMESTAMP_START);
        self.0 = (**self & !Self::TIMESTAMP_MASK) + discord_epoch_timestamp;
        Ok(())
    }

    pub const fn get_worker_id(&self) -> u8 {
        ((self.0 & Self::WORKER_ID_MASK) >> Self::WORKER_ID_START) as u8
    }

    /// Errors with [`SnowflakeOverflowError::WorkerId`] if the `worker_id` exceeds the maximum
    /// field size of [`Snowflake::WORKER_ID_MAX`] ([`Snowflake::WORKER_ID_SIZE`] bits).
    pub fn set_worker_id(&mut self, worker_id: u64) -> Result<(), SnowflakeOverflowError> {
        if worker_id > Self::WORKER_ID_MAX { return Err(SnowflakeOverflowError::WorkerId) }

        self.0 = (**self & !Self::WORKER_ID_MASK) + (Self::WORKER_ID_MASK & (worker_id << Self::WORKER_ID_START));
        Ok(())
    }

    pub const fn get_process_id(&self) -> u8 {
        ((self.0 & Self::PROCESS_ID_MASK) >> Self::PROCESS_ID_START) as u8
    }

    /// Errors with [`SnowflakeOverflowError::ProcessId`] if the `process_id` exceeds the maxim
    /// field size of [`Snowflake::PROCESS_ID_MAX`] ([`Snowflake::PROCESS_ID_SIZE`] bits).
    pub fn set_process_id(&mut self, process_id: u64) -> Result<(), SnowflakeOverflowError> {
        if process_id > Self::PROCESS_ID_MAX { return Err(SnowflakeOverflowError::ProcessId) }

        self.0 = (**self & !Self::PROCESS_ID_MASK) + (Self::PROCESS_ID_MASK & (process_id << Self::PROCESS_ID_START));
        Ok(())
    }

    pub const fn get_increment(&self) -> u16 {
        ((self.0 & Self::INCREMENT_MASK) >> Self::INCREMENT_START) as u16
    }

    /// Errors with [`SnowflakeOverflowError::Increment`] if the `increment` exceeds the maximum
    /// field size of [`Snowflake::INCREMENT_MAX`] ([`Snowflake::INCREMENT_SIZE`] bits).
    pub fn set_increment(&mut self, increment: u64) -> Result<(), SnowflakeOverflowError> {
        if increment > Self::INCREMENT_MAX { return Err(SnowflakeOverflowError::Increment) }

        self.0 = (**self & !Self::INCREMENT_MASK) + (Self::INCREMENT_MASK & (increment << Self::INCREMENT_START));
        Ok(())
    }
}



impl Deref for Snowflake {
    type Target = u64;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl AsRef<u64> for Snowflake {
    fn as_ref(&self) -> &u64 {
        self.deref()
    }
}

impl Display for Snowflake {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl std::str::FromStr for Snowflake {
    type Err = core::num::ParseIntError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let value = u64::from_str_radix(s, 10)?;
        Ok(Snowflake(value))
    }
}

impl From<u64> for Snowflake {
    fn from(value: u64) -> Self {
        Snowflake(value)
    }
}

impl From<i64> for Snowflake {
    fn from(value: i64) -> Self {
        Snowflake(value as u64)
    }
}

impl TryFrom<&str> for Snowflake {
    type Error = core::num::ParseIntError;
    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value = u64::from_str_radix(value, 10)?;
        Ok(Snowflake(value))
    }
}

impl TryFrom<String> for Snowflake {
    type Error = core::num::ParseIntError;
    fn try_from(value: String) -> Result<Self, Self::Error> {
        Self::try_from(value.as_str())
    }
}

struct SnowflakeVisitor;

impl<'de> Visitor<'de> for SnowflakeVisitor {
    type Value = Snowflake;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(formatter, "a u64, i64, String or &str")
    }

    fn visit_u64<E>(self, v: u64) -> Result<Self::Value, E>
    where E: serde::de::Error {
        Ok(Snowflake(v))
    }

    fn visit_i64<E>(self, v: i64) -> Result<Self::Value, E>
    where E: serde::de::Error {
        Ok(Snowflake(v as u64))
    }

    fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
    where E: serde::de::Error {
        Snowflake::try_from(v).map_err(|err| E::custom(err))
    }

    fn visit_string<E>(self, v: String) -> Result<Self::Value, E>
    where E: serde::de::Error {
        Snowflake::try_from(v).map_err(|err| E::custom(err))
    }
}

impl<'de> Deserialize<'de> for Snowflake {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where D: serde::Deserializer<'de> {
        deserializer.deserialize_any(SnowflakeVisitor)
    }
}



#[cfg(test)]
mod tests {
    use super::*;
    use chrono::DateTime;

    // TODO: Change to `const` when `expect` method in `Option` and `Result` gets stabilized as `const`.
    fn test_snowflake() -> Snowflake {
        Snowflake::new(DateTime::from_timestamp_millis(1462015105796).expect("Should be a valid timestamp in milliseconds"), 1, 0, 7).expect("Should be a valid snowflake")
    }

    #[test]
    fn snowflake_new() {
        let snowflake = Snowflake::default();
        assert_eq!(*snowflake, 0b0000000000000000000000000000000000000000000000000000000000000000);

        let snowflake = test_snowflake();
        assert_eq!(*snowflake, 0b0000001001110001000001100101101011000001000000100000000000000111);

        let snowflake = Snowflake::new(DateTime::from_timestamp_millis((Snowflake::TIMESTAMP_MAX + DISCORD_EPOCH) as i64).expect("Should be a valid timestamp in milliseconds"), 0, 0, 0);
        assert!(snowflake.is_ok());
        assert_eq!(*snowflake.unwrap(), Snowflake::TIMESTAMP_MASK);

        let snowflake = Snowflake::new(DateTime::from_timestamp_millis(DISCORD_EPOCH as i64).expect("Should be a valid timestamp in milliseconds"), Snowflake::WORKER_ID_MAX, 0, 0);
        assert!(snowflake.is_ok());
        assert_eq!(*snowflake.unwrap(), Snowflake::WORKER_ID_MASK);

        let snowflake = Snowflake::new(DateTime::from_timestamp_millis(DISCORD_EPOCH as i64).expect("Should be a valid timestamp in milliseconds"), 0, Snowflake::PROCESS_ID_MAX, 0);
        assert!(snowflake.is_ok());
        assert_eq!(*snowflake.unwrap(), Snowflake::PROCESS_ID_MASK);

        let snowflake = Snowflake::new(DateTime::from_timestamp_millis(DISCORD_EPOCH as i64).expect("Should be a valid timestamp in milliseconds"), 0, 0, Snowflake::INCREMENT_MAX);
        assert!(snowflake.is_ok());
        assert_eq!(*snowflake.unwrap(), Snowflake::INCREMENT_MASK);

        let snowflake = Snowflake::new(DateTime::from_timestamp_millis((Snowflake::TIMESTAMP_MAX + DISCORD_EPOCH) as i64).expect("Should be a valid timestamp in milliseconds"), Snowflake::WORKER_ID_MAX, Snowflake::PROCESS_ID_MAX, Snowflake::INCREMENT_MAX);
        assert!(snowflake.is_ok());
        assert_eq!(*snowflake.unwrap(), 0b1111111111111111111111111111111111111111111111111111111111111111);
    }

    #[test]
    fn snowflake_new_error() {
        let snowflake = Snowflake::new(DateTime::from_timestamp_millis((DISCORD_EPOCH - 1) as i64).expect("Should be a valid timestamp in milliseconds"), 0, 0, 0);
        assert_eq!(snowflake, Err(SnowflakeError::InvalidTimestamp));

        let snowflake = Snowflake::new(DateTime::from_timestamp_millis((Snowflake::TIMESTAMP_MAX + DISCORD_EPOCH + 1) as i64).expect("Should be a valid timestamp in milliseconds"), 0, 0, 0);
        assert_eq!(snowflake, Err(SnowflakeError::Overflow(SnowflakeOverflowError::Timestamp)));

        let snowflake = Snowflake::new(DateTime::from_timestamp_millis(DISCORD_EPOCH as i64).expect("Should be a valid timestamp in milliseconds"), Snowflake::WORKER_ID_MAX + 1, 0, 0);
        assert_eq!(snowflake, Err(SnowflakeError::Overflow(SnowflakeOverflowError::WorkerId)));

        let snowflake = Snowflake::new(DateTime::from_timestamp_millis(DISCORD_EPOCH as i64).expect("Should be a valid timestamp in milliseconds"), 0, Snowflake::PROCESS_ID_MAX + 1, 0);
        assert_eq!(snowflake, Err(SnowflakeError::Overflow(SnowflakeOverflowError::ProcessId)));

        let snowflake = Snowflake::new(DateTime::from_timestamp_millis(DISCORD_EPOCH as i64).expect("Should be a valid timestamp in milliseconds"), 0, 0, Snowflake::INCREMENT_MAX + 1);
        assert_eq!(snowflake, Err(SnowflakeError::Overflow(SnowflakeOverflowError::Increment)));
    }

    #[test]
    fn snowflake_get_timestamp() {
        let snowflake = test_snowflake();
        assert_eq!(snowflake.get_timestamp(), DateTime::from_timestamp_millis(1462015105796).expect("Should be a valid timestamp in milliseconds"));
    }

    #[test]
    fn snowflake_set_timestamp() {
        let mut snowflake = Snowflake::default();

        assert_eq!(snowflake.set_timestamp(DateTime::from_timestamp_millis((Snowflake::TIMESTAMP_MAX + DISCORD_EPOCH) as i64).expect("Should be a valid timestamp in milliseconds")), Ok(()));
        assert_eq!(snowflake.get_timestamp(), DateTime::from_timestamp_millis((Snowflake::TIMESTAMP_MAX + DISCORD_EPOCH) as i64).expect("Should be a valid timestamp in milliseconds"));

        assert_eq!(snowflake.set_timestamp(DateTime::from_timestamp_millis((Snowflake::TIMESTAMP_MAX + DISCORD_EPOCH + 1) as i64).expect("Should be a valid timestamp in milliseconds")), Err(SnowflakeError::Overflow(SnowflakeOverflowError::Timestamp)));
        assert_eq!(snowflake.get_timestamp(), DateTime::from_timestamp_millis((Snowflake::TIMESTAMP_MAX + DISCORD_EPOCH) as i64).expect("Should be a valid timestamp in milliseconds"));

        assert_eq!(snowflake.set_timestamp(DateTime::from_timestamp_millis(DISCORD_EPOCH as i64).unwrap()), Ok(()));
        assert_eq!(snowflake, Snowflake::default());
    }

    #[test]
    fn snowflake_get_worker_id() {
        let snowflake = test_snowflake();
        assert_eq!(snowflake.get_worker_id(), 1);
    }

    #[test]
    fn snowflake_set_worker_id() {
        let mut snowflake = Snowflake::default();

        assert_eq!(snowflake.set_worker_id(7), Ok(()));
        assert_eq!(snowflake.get_worker_id(), 7);

        assert_eq!(snowflake.set_worker_id(Snowflake::WORKER_ID_MAX + 1), Err(SnowflakeOverflowError::WorkerId));
        assert_eq!(snowflake.get_worker_id(), 7);

        assert_eq!(snowflake.set_worker_id(Snowflake::WORKER_ID_MAX), Ok(()));
        assert_eq!(snowflake.get_worker_id() as u64, Snowflake::WORKER_ID_MAX);

        assert_eq!(snowflake.set_worker_id(0), Ok(()));
        assert_eq!(snowflake, Snowflake::default());
    }

    #[test]
    fn snowflake_get_process_id() {
        let snowflake = test_snowflake();
        assert_eq!(snowflake.get_process_id(), 0);
    }

    #[test]
    fn snowflake_set_process_id() {
        let mut snowflake = Snowflake::default();

        assert_eq!(snowflake.set_process_id(13), Ok(()));
        assert_eq!(snowflake.get_process_id(), 13);

        assert_eq!(snowflake.set_process_id(Snowflake::PROCESS_ID_MAX + 1), Err(SnowflakeOverflowError::ProcessId));
        assert_eq!(snowflake.get_process_id(), 13);

        assert_eq!(snowflake.set_process_id(Snowflake::PROCESS_ID_MAX), Ok(()));
        assert_eq!(snowflake.get_process_id() as u64, Snowflake::PROCESS_ID_MAX);

        assert_eq!(snowflake.set_process_id(0), Ok(()));
        assert_eq!(snowflake, Snowflake::default());
    }

    #[test]
    fn snowflake_get_increment() {
        let snowflake = test_snowflake();
        assert_eq!(snowflake.get_increment(), 7);
    }

    #[test]
    fn snowflake_set_increment() {
        let mut snowflake = Snowflake::default();

        assert_eq!(snowflake.set_increment(40), Ok(()));
        assert_eq!(snowflake.get_increment(), 40);

        assert_eq!(snowflake.set_increment(Snowflake::INCREMENT_MAX + 1), Err(SnowflakeOverflowError::Increment));
        assert_eq!(snowflake.get_increment(), 40);

        assert_eq!(snowflake.set_increment(Snowflake::INCREMENT_MAX), Ok(()));
        assert_eq!(snowflake.get_increment() as u64, Snowflake::INCREMENT_MAX);

        assert_eq!(snowflake.set_increment(0), Ok(()));
        assert_eq!(snowflake, Snowflake::default());
    }
}
