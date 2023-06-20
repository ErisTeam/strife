use tauri::{ AppHandle, Manager, UserAttentionType };

pub async fn new_message(
	message: crate::discord::types::message::Message,
	handle: &AppHandle,
	user_data: Option<crate::discord::user::UserData>
) {
	use crate::discord::idk::get_avatar;
	use std::{ fs::File, io::prelude::* };
	use tauri::api::notification::Notification;

	let config = handle.config();

	let channel_id = message.channel_id;
	let channel_name;
	if let Some(user_data) = user_data {
		channel_name = user_data
			.get_guild_by_channel(&channel_id)
			.unwrap()
			.get_channel(&channel_id)
			.unwrap()
			.get_name()
			.to_string();
	} else {
		channel_name = "unknown".to_string();
	}

	let path = handle.path_resolver().app_cache_dir();
	let icon;
	if let Some(path) = path {
		println!("path: {:?}", path);

		let path = path.join("avatars");
		if !path.exists() {
			std::fs::create_dir(&path).unwrap();
		}

		let mut file = File::create(path.join(format!("{}.webp", message.author.id))).unwrap();
		let resp = get_avatar(message.author.id.clone(), message.author.avatar.unwrap()).await;

		if let Ok(resp) = resp {
			file.write_all(&resp).unwrap();
		}
		icon = Some(path.join(format!("avatars/{}.webp", message.author.id)));
	} else {
		icon = None;
	}

	// notification
	// 	.title("New Message")
	// 	.body(format!("{}: {}", message.author.username, message.content))
	// 	.icon(icon)
	// 	.show()
	// 	.unwrap();

	let title = format!("{}: {}", channel_name, message.author.username);
	let body = format!("{}", message.content);

	if cfg!(windows) {
		println!("windows");
		use winrt_notification::Toast;

		let powershell_app_id = &Toast::POWERSHELL_APP_ID.to_string();
		let id = config.tauri.bundle.identifier.clone();
		//TODO: clean
		println!("{} {}", powershell_app_id, id);
		let mut toast = Toast::new(powershell_app_id).title(title.as_str()).text1(body.as_str());
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
			.title(title.as_str())
			.body(body.as_str());

		if let Some(icon) = icon {
			notification = notification.icon(icon.to_str().unwrap());
		}
		let _ = notification.show();
	}
	let windows = handle.windows();
	let window = windows.iter().next().unwrap().1;
	let _ = window.request_user_attention(Some(UserAttentionType::Informational));
}
