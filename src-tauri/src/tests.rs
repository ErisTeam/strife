#[cfg(test)]
mod tests {

    mod gateway {
        use std::fs;

        use crate::discord::{
            gateway_packets::GatewayIncomingPacket,
            types::{channel::partial_channels::GuildChannel, gateway::ReadyData},
        };
        #[test]
        fn hello() {
            let json: GatewayIncomingPacket =
                serde_json::from_reader(fs::File::open("../tests/hello.json").unwrap()).unwrap();

            assert!(matches!(
                json.d,
                crate::discord::gateway_packets::GatewayPacketsData::Hello { .. }
            ));
        }

        #[test]
        fn ready() {
            let json: GatewayIncomingPacket =
                serde_json::from_reader(fs::File::open("../tests/ready.json").unwrap()).unwrap();

            assert!(matches!(
                json.d,
                crate::discord::gateway_packets::GatewayPacketsData::Ready(_)
            ));
        }
        #[test]
        fn ready_supplemental() {
            let json: GatewayIncomingPacket = serde_json::from_reader(
                fs::File::open("../tests/ready supplemental.json").unwrap(),
            )
            .unwrap();

            assert!(matches!(
                json.d,
                crate::discord::gateway_packets::GatewayPacketsData::ReadySupplemental { .. }
            ));
        }
    }
}
