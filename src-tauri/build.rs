use std::{fs, io::Result};
fn main() -> Result<()> {
    proto_buf()?;
    tauri_build::build();
    Ok(())
}

fn proto_buf() -> Result<()> {
    let mut prost_config = prost_build::Config::new();
    // prost_config.protoc_arg("--proto_path=../protoc-23.2/include/");
    prost_config.compile_well_known_types();

    let mut files = Vec::new();
    let dir_iter = fs::read_dir("src/proto").unwrap();
    for file in dir_iter {
        if let Ok(file) = file {
            let path = file.path();
            if !path.is_file() {
                continue;
            }
            files.push(path);
        }
    }
    // prost_config.type_attribute(".", "#[derive(serde::Serialize)]");

    prost_config.compile_protos(&files, &["src/"])?;
    Ok(())
}
