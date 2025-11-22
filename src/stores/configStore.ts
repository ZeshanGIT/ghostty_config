/**
 * Config Store
 *
 * Zustand store for managing Ghostty configuration state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ParsedConfigFile, ConfigWarning } from '@/types/config';
import { parseConfigFile } from '@/lib/parser/propertiesParser';
import {
  saveConfigFile,
  buildSaveOptions,
  getChangeSummary,
  type ChangeSummary,
} from '@/lib/parser/propertiesSaver';
import { PROPERTY_MAP } from '@/data/ghostty-schema.generated';
import {
  readConfigFile,
  writeConfigFile,
  getFileMetadata,
  createBackup,
  getDefaultConfigPath,
} from '@/lib/tauri/fileCommands';

interface ConfigState {
  // Current configuration values (property key -> value)
  config: Map<string, string | string[]>;

  // Parsed config file (for saving back with smart merge)
  parsedFile: ParsedConfigFile | null;

  // Path to the currently loaded config file
  filePath: string | null;

  // Timestamp when file was loaded
  loadedTimestamp: number | null;

  // Properties that have been modified by user
  modifiedProperties: Set<string>;

  // Active category and section for navigation
  activeCategory: string | null;
  activeSection: string | null;

  // Loading/saving state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Warnings from parser
  warnings: ConfigWarning[];

  // Actions
  loadConfigFile: (path: string) => Promise<void>;
  loadDefaultConfig: () => Promise<void>;
  saveConfig: () => Promise<void>;
  updateProperty: (key: string, value: string | string[]) => void;
  removeProperty: (key: string) => void;
  setActiveCategory: (category: string | null) => void;
  setActiveSection: (section: string | null) => void;
  resetProperty: (key: string) => void;
  resetAll: () => void;
  getChangeSummary: () => ChangeSummary;
  clearError: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      config: new Map(),
      parsedFile: null,
      filePath: null,
      loadedTimestamp: null,
      modifiedProperties: new Set(),
      activeCategory: null,
      activeSection: null,
      isLoading: false,
      isSaving: false,
      error: null,
      warnings: [],

      /**
       * Load a config file from disk
       */
      loadConfigFile: async (path: string) => {
        set({ isLoading: true, error: null });

        try {
          // Read file content
          const content = await readConfigFile(path);

          // Get file metadata for change detection
          const metadata = await getFileMetadata(path);

          // Parse the file
          const parsedFile = parseConfigFile(content, PROPERTY_MAP);

          // Update state
          set({
            config: parsedFile.parseResult.valid,
            parsedFile,
            filePath: path,
            loadedTimestamp: metadata.modified_time,
            modifiedProperties: new Set(),
            warnings: parsedFile.parseResult.warnings,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load config file',
            isLoading: false,
          });
        }
      },

      /**
       * Load the default config file for the current platform
       */
      loadDefaultConfig: async () => {
        try {
          const defaultPath = await getDefaultConfigPath();
          await get().loadConfigFile(defaultPath);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load default config',
          });
        }
      },

      /**
       * Save the current config to disk
       */
      saveConfig: async () => {
        const state = get();
        const { filePath, parsedFile, config, modifiedProperties } = state;

        if (!filePath) {
          set({ error: 'No file path set' });
          return;
        }

        if (!parsedFile) {
          set({ error: 'No config loaded' });
          return;
        }

        set({ isSaving: true, error: null });

        try {
          // Check if file was modified externally
          const currentMetadata = await getFileMetadata(filePath);
          if (
            state.loadedTimestamp &&
            currentMetadata.exists &&
            currentMetadata.modified_time > state.loadedTimestamp
          ) {
            // File was modified - warn user
            // For now, we'll proceed with save. Phase 3 will add conflict resolution UI.
            console.warn('File was modified externally');
          }

          // Create backup
          await createBackup(filePath);

          // Build save options
          const saveOptions = buildSaveOptions(
            parsedFile,
            config,
            modifiedProperties,
            PROPERTY_MAP
          );

          // Generate new file content
          const newContent = saveConfigFile(parsedFile, saveOptions);

          // Write to disk
          await writeConfigFile(filePath, newContent);

          // Update metadata
          const newMetadata = await getFileMetadata(filePath);

          // Re-parse the saved file to update our state
          const newParsedFile = parseConfigFile(newContent, PROPERTY_MAP);

          set({
            parsedFile: newParsedFile,
            loadedTimestamp: newMetadata.modified_time,
            modifiedProperties: new Set(),
            isSaving: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to save config',
            isSaving: false,
          });
        }
      },

      /**
       * Update a property value
       */
      updateProperty: (key: string, value: string | string[]) => {
        set(state => {
          const newConfig = new Map(state.config);
          newConfig.set(key, value);
          const newModified = new Set(state.modifiedProperties);
          newModified.add(key);

          return {
            config: newConfig,
            modifiedProperties: newModified,
          };
        });
      },

      /**
       * Remove a property (will be deleted from file on save)
       */
      removeProperty: (key: string) => {
        set(state => {
          const newConfig = new Map(state.config);
          newConfig.delete(key);
          const newModified = new Set(state.modifiedProperties);
          newModified.add(key); // Mark as modified so it gets removed on save

          return {
            config: newConfig,
            modifiedProperties: newModified,
          };
        });
      },

      /**
       * Set active category
       */
      setActiveCategory: (category: string | null) => {
        set({ activeCategory: category });
      },

      /**
       * Set active section
       */
      setActiveSection: (section: string | null) => {
        set({ activeSection: section });
      },

      /**
       * Reset a property to its default value
       */
      resetProperty: (key: string) => {
        const property = PROPERTY_MAP.get(key);
        if (property && property.defaultValue) {
          get().updateProperty(key, property.defaultValue);
        } else {
          get().removeProperty(key);
        }
      },

      /**
       * Reset all properties
       */
      resetAll: () => {
        set({
          config: new Map(),
          modifiedProperties: new Set(),
        });
      },

      /**
       * Get change summary
       */
      getChangeSummary: () => {
        const state = get();
        const { parsedFile, config, modifiedProperties } = state;

        if (!parsedFile) {
          return { modified: [], added: [], removed: [], total: 0 };
        }

        const saveOptions = buildSaveOptions(parsedFile, config, modifiedProperties, PROPERTY_MAP);

        return getChangeSummary(saveOptions);
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'ghostty-config-storage',
      partialize: state => ({
        filePath: state.filePath,
        activeCategory: state.activeCategory,
        activeSection: state.activeSection,
      }),
      // Skip serializing Maps and Sets - they'll be reconstructed on load
    }
  )
);
