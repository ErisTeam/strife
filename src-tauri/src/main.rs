#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod tests;

mod discord;
mod events;
mod notifications;

mod main_app_state;

mod event_manager;
mod manager;

mod modules;
mod token_utils;
mod webview_packets;

mod test;

extern crate tokio;

use std::{
    path::{Path, PathBuf},
    sync::Arc,
};

use log::{debug, error, info, warn};
use serde::Deserialize;
use tauri::{Manager, State, UserAttentionType};
use tauri_plugin_log::LogTarget;

use crate::{main_app_state::MainState, manager::ThreadManager};

#[tauri::command]
fn set_state(new_state: String, state: State<Arc<MainState>>, handle: tauri::AppHandle) {
    println!("change state {}", new_state);
    match new_state.as_str() {
        "Application" => {
            println!("Application");
            if matches!(
                *state.state.lock().unwrap(),
                main_app_state::State::MainApp { .. },
            ) {
                println!("Already in main app");
                return;
            }
            state.change_state(main_app_state::State::MainApp {}, handle, false)
        }
        "LoginScreen" => {
            if matches!(
                *state.state.lock().unwrap(),
                main_app_state::State::LoginScreen { .. }
            ) {
                println!("Already in login screen");
                return;
            }
            state.change_state(main_app_state::State::default_login_screen(), handle, false);
        }
        _ => {
            println!("Unknown state {}", new_state);
        }
    }
}

#[tauri::command]
fn get_token(user_id: String, state: State<Arc<MainState>>) -> Option<String> {
    state.get_token(user_id)
}

#[tauri::command]
fn get_last_user(state: State<Arc<MainState>>) -> Option<String> {
    println!("get_last_user");
    println!("{:?}", state.last_id.lock().unwrap());
    state.last_id.lock().unwrap().clone()
}
#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
    // Close splashscreen
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.close().unwrap();
    }
    // Show main window
    window.get_window("main").unwrap().show().unwrap();
}

#[derive(Debug, Deserialize)]
struct TestData {}

#[cfg(debug_assertions)]
#[tauri::command]
async fn test(handle: tauri::AppHandle) {
    println!("test");

    // let mut path = handle.path_resolver().app_cache_dir().unwrap();
    // path.push("413428675866787863");
    // path.set_extension("webp");
    // println!("{:?}", path);
    let windows = handle.windows();
    let window = windows.iter().next().unwrap().1;
    tokio::time::sleep(Duration::from_millis(1000)).await;
    window
        .request_user_attention(Some(UserAttentionType::Informational))
        .unwrap();
    println!("test");

    //use notify_rust::Notification;

    use std::time::Duration;

    use winrt_notification::Toast;

    //notifications::new_message(Message::default(), &handle, None).await;
}

fn create_log_formater(path: PathBuf) {
    //use owo_colors::{OwoColorize, Stream::Stdout};
    //create path if it doesn't exist
    let path = Path::new(&path).join("latest.log");
    if !path.exists() {
        std::fs::create_dir_all(path.parent().unwrap()).unwrap();
    }
    println!("{:?}", path);

    fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "{}[{}][{}] {}",
                chrono::Local::now().format("[%y-%b-%d %H:%M:%S]"),
                record.target(),
                record.level(),
                message
            ))
        })
        .level(log::LevelFilter::Debug)
        .chain(std::io::stdout())
        .chain(fern::log_file(path).unwrap())
        .apply()
        .unwrap();
}
fn test_logs() {
    info!("test");
    warn!("test");
    error!("test");
    log::trace!("test");
    debug!("test");
}

fn main() {
    println!("Starting");

    let main_state = Arc::new(MainState::new());

    let thread_manager = ThreadManager::new(main_state.clone());

    let event_manager = event_manager::EventManager::new(main_state.clone());

    *main_state.thread_manager.lock().unwrap() = Some(thread_manager);

    *main_state.event_manager.lock().unwrap() = Some(event_manager);

    let m = main_state.clone();

    #[cfg(debug_assertions)]
    test::add_token(&m);

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build(),
        )
        .manage(main_state)
        .setup(move |app| {
            // let log_dir = app.path_resolver().app_log_dir();
            // if let Some(log_dir) = log_dir {
            //     println!("{:?}", log_dir);
            //     create_log_formater(log_dir);
            test_logs();
            //}

            let app_handle = app.handle();

            // let splashscreen_window = app.get_window("splashscreen").unwrap();
            // let main_window = app.get_window("main").unwrap();
            m.change_state(
                main_app_state::State::default_login_screen(),
                app_handle,
                false,
            );
            // splashscreen_window.close().unwrap();
            // main_window.show().unwrap();
            println!("Closing Loading Screen");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_token,
            set_state,
            get_last_user,
            close_splashscreen,
            test
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application.");
}
