// FIXME: Brokers should be defined as part of the main crate. The return types should be our own
// custom types.

use crate::types::*;
use snowflake::Snowflake;

pub trait FullBroker: guild::GuildBroker { }

// TODO:
#[derive(Debug)]
pub enum BrokerError {
    Idk
}

pub struct DiscordBroker {
    authorization: String,
    client: reqwest::Client,
}

impl DiscordBroker {
    const API_VERSION: u8 = 9;
    const API_URL: &'static str = "https://discord.com/api/v9";

    pub fn new(authorization: String) -> Self {
        Self {
            authorization,
            client: reqwest::Client::new()
        }
    }
}

impl guild::GuildBroker for DiscordBroker {
    type Error = BrokerError;

    async fn guild_list(&self) -> Result<Vec<guild::UserGuild>, Self::Error> {
        let response = self.client
            .get(format!("{}/users/@me/guilds", Self::API_URL))
            .header("Authorization", self.authorization.clone())
            .send()
            .await
            .expect("Request should be successful");

        Ok(response.json::<Vec<guild::UserGuild>>().await.expect("Who knows"))
    }

    async fn guild_get(&self, guild_id: &Snowflake) -> Result<guild::Guild, Self::Error> {
        let response = self.client
            .get(format!("{}/guilds/{}", Self::API_URL, guild_id))
            .header("Authorization", self.authorization.clone())
            .send()
            .await
            .expect("Request should be successful");

        Ok(response.json::<guild::Guild>().await.expect("Who knows"))
    }

    async fn guild_get_preview(&self, guild_id: &Snowflake) -> Result<guild::GuildPreview, Self::Error> {
        let response = self.client
            .get(format!("{}/guilds/{}/preview", Self::API_URL, guild_id))
            .header("Authorization", self.authorization.clone())
            .send()
            .await
            .expect("Request should be successful");

        Ok(response.json::<guild::GuildPreview>().await.expect("Who knows"))
    }

    async fn guild_create(&self, guild_params: guild::http::CreateGuild) -> Result<Snowflake, Self::Error> {
        dbg!(serde_json::to_value(&guild_params));
        let response = self.client
            .post(format!("{}/guilds", Self::API_URL))
            .header("Authorization", self.authorization.clone())
            .json(&guild_params)
            .send()
            .await
            .expect("Request should be successful");

        let test = response.json::<serde_json::Value>().await;
        dbg!(&test);
        //Ok(test.expect("Who knows").id)
        Ok(Snowflake::default())
        //Ok(Snowflake::default())
    }

    // TODO:
    //async fn guild_modify(&self, guild_id: &Snowflake, guild_params: guild::http::ModifyGuild) -> Result<guild::Guild, Self::Error> {
    //    let response = self.client
    //        .patch(format!("{}/guilds/{}", Self::API_URL, guild_id))
    //        .header("Authorization", self.authorization.clone())
    //        .json(&guild_params)
    //        .send()
    //        .await
    //        .expect("Request should be successful");

    //    Ok(response.json::<guild::Guild>().await.expect("Who knows"))
    //}
}

#[cfg(test)]
pub(crate) mod tests {
    use crate::broker::DiscordBroker;

    pub(crate) fn test_env() -> DiscordBroker {
        dotenv::dotenv().expect("`.env` file should be in `discord` module");
        let authorization = dotenv::var("AUTHORIZATION").expect("`AUTHORIZATION` env variable should be defined");

        DiscordBroker::new(authorization)
    }
}
