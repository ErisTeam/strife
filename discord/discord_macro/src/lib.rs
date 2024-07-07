use proc_macro2::TokenStream;
use quote::quote;
use syn::{ self };

#[derive(deluxe::ExtractAttributes)]
#[deluxe(attributes(websocket))]
struct WebsocketAttribute {
    #[deluxe(default = syn::Type::Tuple(syn::parse_quote!(())))]
    connection_data: syn::Type,
}

pub(crate) fn impl_websocket_macro(item: TokenStream) -> deluxe::Result<TokenStream> {
    let mut input = syn::parse2::<syn::DeriveInput>(item)?;
    let attrs: WebsocketAttribute = deluxe::extract_attributes(&mut input)?;

    let connection_data = attrs.connection_data;

    let name = &input.ident;
    let (impl_generics, type_generics, where_clause) = input.generics.split_for_impl();

    let gen =
        quote! {
		impl #impl_generics Websocket for #name #type_generics #where_clause{
				
				type ConnectionData = #connection_data;
				type MessageType = ();
				type ConnectionInfo = ConnectionInfo<Self::ConnectionData,Self::MessageType>;
				async fn start_websocket(&self, connection_data: Self::ConnectionData,return_channel: tokio::sync::mpsc::Sender<Self::MessageType>,connection_url:String) -> anyhow::Result<()>{
					use log::{info,error};
					use std::{sync::Arc};
					let (error_sender, error_reciver) = tokio::sync::broadcast::channel::<String>(1); //TODO: change to error

					let (message_sender, message_reciver) = tokio::sync::mpsc::channel::<Self::MessageType>(1);
					
					let websocket =  Arc::new(websocket_connection::WebsocketConnection::new(connection_url).await?);

					let connection_info = Arc::new(tokio::sync::Mutex::new(ConnectionInfo::new(connection_data,return_channel)));

					let stop = connection_info.lock().await.stop.clone();

					let (heartbeat_sender,heartbeat_rec) = tokio::sync::oneshot::channel::<u64>();
					
					// tokio::spawn(async move {
						
						tokio::select! {
							_ = stop.notified() => {
								info!("Stopping {}",stringify!(#name));
							}
							e = Self::heartbeat_thread(connection_info.clone(),websocket.clone(),heartbeat_rec) => {
								error!("Heartbeat thread crashed {:?}",e);
								error_sender.send("Heartbeat thread crashed".to_string()).unwrap();
							}
							e = Self::logic_thread(connection_info.clone(),websocket.clone(),heartbeat_sender) => {
								error!("Logic thread crashed {:?}",e);
								error_sender.send("Logic thread crashed".to_string()).unwrap();
							}
						}
					// });
					
					Ok(())
				}
				async fn heartbeat_thread(connection_info: std::sync::Arc<tokio::sync::Mutex<Self::ConnectionInfo>>, websocket: std::sync::Arc<websocket_connection::WebsocketConnection>,start: tokio::sync::oneshot::Receiver<u64>)->anyhow::Result<()>{
					use log::{trace,warn};
					let heartbeat_interval = std::time::Duration::from_millis(start.await.unwrap());
					
					let mut interval = { tokio::time::interval(heartbeat_interval) };
					
					loop {
						interval.tick().await;

						let mut connection_info = connection_info.lock().await;
						if connection_info.ack_recived {
							connection_info.ack_recived = false;
						} else {
							warn!("Heartbeat ack not recived");
							//todo!("return error");
						}

						let packet = Self::get_heartbeat_packet(&connection_info).unwrap();

						websocket.send(packet).await?;
						trace!("Sent heartbeat packet");
					}
				}
				fn stop(&self){
					//TODO: implement
					todo!("implement stop");
				}
				fn send_request(&self, message: Self::MessageType) -> anyhow::Result<()>{
					todo!("implement send_request");
					Ok(())
				}
		}
	};
    Ok(gen.into())
}

#[proc_macro_derive(Websocket, attributes(websocket))]
pub fn websocket_macro_derive(input: proc_macro::TokenStream) -> proc_macro::TokenStream {
    impl_websocket_macro(input.into()).unwrap().into()
}
