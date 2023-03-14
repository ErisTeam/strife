use tauri::{ AppHandle, Manager };

pub async fn new_message(message: crate::discord::types::message::Message, handle: &AppHandle) {
	use std::{ fs::File, io::prelude::* };
	use tauri::api::notification::Notification;
	use crate::flash_window;
	use crate::discord::idk::get_avatar;

	let config = handle.config();
	//let notification = Notification::new(config.tauri.bundle.identifier.clone());

	let path = handle.path_resolver().app_cache_dir();
	let icon;
	if let Some(path) = path {
		println!("path: {:?}", path);
		let mut file = File::create(path.join(format!("{}.webp", message.author.id))).unwrap();
		let resp = get_avatar(message.author.id.clone(), message.author.avatar.unwrap()).await;

		if let Ok(resp) = resp {
			file.write_all(&resp).unwrap();
		}
		icon = Some(path.join(format!("{}.webp", message.author.id)));
	} else {
		icon = None;
	}

	// notification
	// 	.title("New Message")
	// 	.body(format!("{}: {}", message.author.username, message.content))
	// 	.icon(icon)
	// 	.show()
	// 	.unwrap();
	if cfg!(windows) {
		println!("windows");
		use winrt_notification::Toast;

		let powershell_app_id = &Toast::POWERSHELL_APP_ID.to_string();
		let id = config.tauri.bundle.identifier.clone();
		println!("{} {}", powershell_app_id, id);
		let mut toast = Toast::new(powershell_app_id)
			.title(message.author.username.as_str())
			.text1(message.content.as_str());
		println!("{:?}", icon);
		if let Some(icon) = icon {
			toast = toast.icon(icon.as_path(), winrt_notification::IconCrop::Circular, "");
		}
		println!("show");
		tauri::async_runtime::spawn(async move {
			let _ = toast.show();
		});
	} else {
		let mut notification = Notification::new(config.tauri.bundle.identifier.clone())
			.title(message.author.username.as_str())
			.body(message.content.as_str());

		if let Some(icon) = icon {
			notification = notification.icon(icon.to_str().unwrap());
		}
		let _ = notification.show();
	}
	flash_window(&handle).unwrap();
}