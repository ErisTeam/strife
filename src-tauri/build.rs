use std::io::Result;
fn main() -> Result<()> {
	proto_buf()?;
	tauri_build::build();
	Ok(())
}

fn proto_buf() -> Result<()> {
	if cfg!(target_os = "windows") {
		//check if protoc exists
		std::env::set_var("PROTOC", "../protoc-23.2/win64/protoc");
	} else {
		println!("Using protoc from PATH");
	}

	let mut prost_config = prost_build::Config::new();
	prost_config.protoc_arg("--proto_path=../protoc-23.2/include/");

	prost_config.compile_protos(&["src/proto/PreloadedUserSettings.proto"], &["src/"])?;
	Ok(())
}
