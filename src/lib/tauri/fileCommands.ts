/**
 * Tauri File System Commands
 *
 * TypeScript bindings for Tauri file system commands
 */

import { invoke } from '@tauri-apps/api/core';

export interface FileMetadata {
  modified_time: number;
  size: number;
  exists: boolean;
}

/**
 * Read a config file from the filesystem
 */
export async function readConfigFile(path: string): Promise<string> {
  return await invoke<string>('read_config_file', { path });
}

/**
 * Write content to a config file
 */
export async function writeConfigFile(path: string, content: string): Promise<void> {
  await invoke('write_config_file', { path, content });
}

/**
 * Get file metadata (for change detection)
 */
export async function getFileMetadata(path: string): Promise<FileMetadata> {
  return await invoke<FileMetadata>('get_file_metadata', { path });
}

/**
 * Create a backup of a file
 */
export async function createBackup(path: string): Promise<string> {
  return await invoke<string>('create_backup', { path });
}

/**
 * Check if a file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  return await invoke<boolean>('file_exists', { path });
}

/**
 * Get the default config file path for the current platform
 */
export async function getDefaultConfigPath(): Promise<string> {
  return await invoke<string>('get_default_config_path');
}
