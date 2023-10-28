#[cfg(test)]
mod tests {
	mod gateway {
		use std::fs;

		use crate::discord::{
			gateway_packets::{ IncomingPacket, IncomingPacketsData, DispatchedEvents },
			types::gateway::gateway_packets_data::TypingStart,
		};
		#[test]
		fn hello() {
			let json: IncomingPacket = serde_json::from_reader(fs::File::open("../tests/hello.json").unwrap()).unwrap();

			assert!(matches!(json.data, IncomingPacketsData::Hello(_)));
		}

		#[test]
		fn ready() {
			let json: IncomingPacket = serde_json::from_reader(fs::File::open("../tests/ready.json").unwrap()).unwrap();

			match json.data {
				IncomingPacketsData::DispatchedEvent(data) => { assert!(matches!(data, DispatchedEvents::Ready(_))) }
				d => {
					panic!("json.data was {}", d.to_string());
				}
			}
		}
		#[test]
		fn ready_supplemental() {
			let json: IncomingPacket = serde_json
				::from_reader(fs::File::open("../tests/ready supplemental.json").unwrap())
				.unwrap();

			match json.data {
				IncomingPacketsData::DispatchedEvent(data) => {
					assert!(matches!(data, DispatchedEvents::ReadySupplemental(_)))
				}
				d => {
					panic!("json.data was {}", d.to_string());
				}
			}
		}

		#[test]
		fn typing_start() {
			let json: IncomingPacket = serde_json
				::from_reader(fs::File::open("../tests/typing start.json").unwrap())
				.unwrap();

			match json.data {
				IncomingPacketsData::DispatchedEvent(data) => {
					match data {
						DispatchedEvents::Unknown(data) => {
							let a: TypingStart = serde_json::from_value(data).unwrap();
							println!("{:?}", a)
						}
						_ => {
							panic!("json.data was {}", data.to_string());
						}
					}
					// assert!(matches!(data, DispatchedEvents::StartTyping(_)))
				}
				d => {
					panic!("json.data was {}", d.to_string());
				}
			}
		}
	}
}
