use std::fs;
use std::path::PathBuf;
use std::time::SystemTime;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct FileMetadata {
    pub modified_time: u64,
    pub size: u64,
    pub exists: bool,
}

/// Read a config file from the filesystem
#[tauri::command]
fn read_config_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file {}: {}", path, e))
}

/// Write content to a config file
#[tauri::command]
fn write_config_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write file {}: {}", path, e))
}

/// Get file metadata (for change detection)
#[tauri::command]
fn get_file_metadata(path: String) -> Result<FileMetadata, String> {
    match fs::metadata(&path) {
        Ok(metadata) => {
            let modified_time = metadata
                .modified()
                .map_err(|e| format!("Failed to get modified time: {}", e))?
                .duration_since(SystemTime::UNIX_EPOCH)
                .map_err(|e| format!("Invalid system time: {}", e))?
                .as_secs();

            Ok(FileMetadata {
                modified_time,
                size: metadata.len(),
                exists: true,
            })
        }
        Err(_) => Ok(FileMetadata {
            modified_time: 0,
            size: 0,
            exists: false,
        }),
    }
}

/// Create a backup of a file
#[tauri::command]
fn create_backup(path: String) -> Result<String, String> {
    let backup_path = format!("{}.bak", path);

    // Check if source file exists
    if !PathBuf::from(&path).exists() {
        return Err(format!("Source file does not exist: {}", path));
    }

    fs::copy(&path, &backup_path)
        .map_err(|e| format!("Failed to create backup: {}", e))?;

    Ok(backup_path)
}

/// Check if a file exists
#[tauri::command]
fn file_exists(path: String) -> bool {
    PathBuf::from(&path).exists()
}

/// Get the default config file path for the current platform
#[tauri::command]
fn get_default_config_path() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME")
            .map_err(|_| "Could not determine home directory".to_string())?;
        Ok(format!("{}/.config/ghostty/config", home))
    }

    #[cfg(target_os = "linux")]
    {
        let config_home = std::env::var("XDG_CONFIG_HOME").ok();
        let home = std::env::var("HOME")
            .map_err(|_| "Could not determine home directory".to_string())?;

        let base = config_home.unwrap_or_else(|| format!("{}/.config", home));
        Ok(format!("{}/ghostty/config", base))
    }

    #[cfg(target_os = "windows")]
    {
        let app_data = std::env::var("APPDATA")
            .map_err(|_| "Could not determine AppData directory".to_string())?;
        Ok(format!("{}\\ghostty\\config", app_data))
    }

    #[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
    {
        Err("Unsupported platform".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_config_file,
            write_config_file,
            get_file_metadata,
            create_backup,
            file_exists,
            get_default_config_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
