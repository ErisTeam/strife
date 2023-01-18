use std::sync::Mutex;

#[derive(Debug)]
pub enum LoginStatus {
    NotLoggedIn,
    LoggedIn,
}

#[derive(Debug)]
pub struct MainState {
    pub login_status: Mutex<LoginStatus>,
}
impl MainState {
    pub fn new() -> Self {
        Self { login_status: Mutex::new(LoginStatus::NotLoggedIn) }
    }
}