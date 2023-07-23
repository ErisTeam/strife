#[cfg(test)]
mod tests {
	mod gateway {
		use std::fs;

		use crate::discord::gateway_packets::{ IncomingPacket, IncomingPacketsData, DispatchedEvents };
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
	}
}
