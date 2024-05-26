pub mod discord_protos {
    pub mod discord_users {
        pub mod v1 {
            pub mod preloaded_user_settings {
                include!(concat!(
                    env!("OUT_DIR"),
                    "/discord_protos.discord_users.v1.preloaded_user_settings.rs"
                ));
            }
        }
    }
}

pub mod d {
    include!(concat!(env!("OUT_DIR"),"/d.rs"));
}

impl Into<bool> for d::GamiToFurras{
    fn into(self) -> bool {
        return self.tak;
    }
}
