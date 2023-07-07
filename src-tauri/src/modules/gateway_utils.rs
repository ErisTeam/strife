use std::{ time::{ Duration }, sync::Arc, fmt::Display };
use tauri::AppHandle;
use async_trait::async_trait;

#[derive(Debug, Clone)]
pub enum Errors {
	ReadError,
}
impl Display for Errors {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		match self {
			Self::ReadError => write!(f, "read error"),
		}
	}
}
impl std::error::Error for Errors {}

#[derive(Debug)]
pub struct ConnectionInfo<D, S> {
	pub ack_recived: bool,

	pub heartbeat_interval: Duration,

	pub timeout_ms: u64,

	pub hearbeat_notify: Arc<tokio::sync::Notify>,

	pub stop: Arc<tokio::sync::Notify>,

	pub handle: tauri::AppHandle,

	pub sender: tokio::sync::mpsc::Sender<S>,

	pub aditional_data: D,
}
impl<T, S> ConnectionInfo<T, S> {
	pub fn new(aditional_data: T, app_handle: AppHandle, sender: tokio::sync::mpsc::Sender<S>) -> Self {
		Self {
			ack_recived: true,
			heartbeat_interval: Duration::ZERO,
			timeout_ms: 0,
			hearbeat_notify: Arc::new(tokio::sync::Notify::new()),
			aditional_data,
			stop: Arc::new(tokio::sync::Notify::new()),
			handle: app_handle,
			sender,
		}
	}
	pub fn start_heartbeat(&self) {
		self.hearbeat_notify.notify_waiters();
	}
}

// #[macro_export]
// macro_rules! create_thread {
// 	(
// 		$error_send:expr,
// 		$stop:expr,
// 		$function:expr,
// 		$($params:tt)*
// 	) => {
//         tokio::spawn(async move {
//             tokio::select! {
//                 _ = $stop.notified() => {
//                     debug!("Stopping thread");
//                 },
//                 e = $function($($$parms,)*) => {
//                     error!("thread encountered an error: {:?}",e);
//                     if let Err(e) = e {
//                         let r = $error_sender.send(e.to_string());
//                         println!("sending result: {:?}",r);
//                     }
//                 },
//             }
//         });
// 	};
// }

#[async_trait]
trait Gateway<D, Se /*where T: Send + Sync*/> {
	fn create_connection_info(&self, sender: tokio::sync::mpsc::Sender<Se>, handle: AppHandle) -> ConnectionInfo<D, Se>;

	//pub async fn start(&mut self) {}

	// fn create_thread<'a, F, Fr, Fd: Send + Sync>(
	// 	&self,
	// 	stop: tokio::sync::Notify,
	// 	error_sender: tokio::sync::mpsc::Sender<()>,
	// 	data: Fd,
	// 	function: F
	// )
	// 	where
	// 		Fd: 'static,
	// 		F: FnOnce(Fd) -> Fr + Send + 'static,
	// 		Fr: Future<Output = crate::Result<()>> + Send + Sync + 'static
	// {
	// 	tokio::spawn(async move {
	// 		tokio::select! {
	// 			_ = stop.notified() => {
	// 				//
	// 			},
	// 			_ = function(data) => {

	// 			},
	// 		}
	// 	});
	// }
}
