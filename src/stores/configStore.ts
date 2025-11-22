/**
 * Zustand Store for Ghostty Configuration
 *
 * Manages the application state for loading, editing, and saving Ghostty config files.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GhosttyConfigSchema, ConfigProperty } from '@/types/schema';
import type { ConfigWarning, ParsedConfigFile } from '@/types/config';
import { loadSchema } from '@/lib/schemaLoader';
import { parseConfigFile } from '@/lib/parser/propertiesParser';
import { saveConfigFile, buildSaveOptions } from '@/lib/parser/propertiesSaver';
import { createPropertyMap } from '@/lib/schemaQueries';
import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';

/**
 * Change summary for modified properties
 */
export interface ChangeSummary {
  modified: string[]; // Properties that have changed value
  added: string[]; // Properties added to config
  removed: string[]; // Properties removed from config
}

/**
 * Main store state
 */
interface ConfigStoreState {
  // Schema
  schema: GhosttyConfigSchema | null;
  schemaLoaded: boolean;

  // Config data
  config: Map<string, string | string[]>;
  originalConfig: Map<string, string | string[]>;
  parsedFile: ParsedConfigFile | null;

  // File metadata
  filePath: string | null;
  lastSavedTimestamp: number | null;

  // Navigation
  activeTab: string;
  activeSection: string;

  // Warnings and errors
  warnings: ConfigWarning[];
  error: string | null;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  loadSchema: () => Promise<void>;
  loadConfigFile: (path: string) => Promise<void>;
  loadDefaultConfig: () => Promise<void>;
  openConfigFile: () => Promise<void>;
  saveConfig: () => Promise<void>;
  saveConfigAs: () => Promise<void>;
  updateProperty: (key: string, value: string | string[]) => void;
  removeProperty: (key: string) => void;
  resetProperty: (key: string) => void;
  setActiveTab: (tabId: string) => void;
  setActiveSection: (sectionId: string) => void;
  getChangeSummary: () => ChangeSummary;
  hasUnsavedChanges: () => boolean;
  discardChanges: () => void;
}

/**
 * Helper: Get default value for a property from schema
 */
function getDefaultValue(property: ConfigProperty): string | string[] | null {
  return property.defaultValue as string | string[] | null;
}

/**
 * Create the Zustand store
 */
export const useConfigStore = create<ConfigStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      schema: null,
      schemaLoaded: false,
      config: new Map(),
      originalConfig: new Map(),
      parsedFile: null,
      filePath: null,
      lastSavedTimestamp: null,
      activeTab: 'appearance',
      activeSection: 'font',
      warnings: [],
      error: null,
      isLoading: false,
      isSaving: false,

      /**
       * Load the JSON schema
       */
      loadSchema: async () => {
        try {
          const schema = await loadSchema();
          set({ schema, schemaLoaded: true, error: null });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load schema';
          set({ error: message });
        }
      },

      /**
       * Load a config file from disk
       */
      loadConfigFile: async (path: string) => {
        set({ isLoading: true, error: null });

        try {
          // Read file via Tauri
          const content = await invoke<string>('read_config_file', { path });

          // Parse config file
          const schema = get().schema;
          if (!schema) {
            throw new Error('Schema not loaded. Call loadSchema() first.');
          }

          const propertyMap = createPropertyMap(schema);
          const parsedFile = parseConfigFile(content, propertyMap);

          // Store parsed data
          const config = new Map(parsedFile.parseResult.valid);
          const originalConfig = new Map(parsedFile.parseResult.valid);

          set({
            config,
            originalConfig,
            parsedFile,
            filePath: path,
            lastSavedTimestamp: Date.now(),
            warnings: parsedFile.parseResult.warnings,
            error: null,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load config file';
          set({ error: message, isLoading: false });
        }
      },

      /**
       * Load the default platform config
       */
      loadDefaultConfig: async () => {
        try {
          const defaultPath = await invoke<string>('get_default_config_path');
          const exists = await invoke<boolean>('file_exists', { path: defaultPath });

          if (!exists) {
            set({
              error: `Default config file not found at: ${defaultPath}`,
            });
            return;
          }

          await get().loadConfigFile(defaultPath);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load default config';
          set({ error: message });
        }
      },

      /**
       * Open file dialog and load selected config file
       */
      openConfigFile: async () => {
        try {
          const selected = await open({
            multiple: false,
            filters: [
              {
                name: 'Config Files',
                extensions: ['properties', 'conf', 'config'],
              },
            ],
          });

          if (selected && typeof selected === 'string') {
            await get().loadConfigFile(selected);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to open file';
          set({ error: message });
        }
      },

      /**
       * Save config to current file path
       */
      saveConfig: async () => {
        const { filePath, config, originalConfig, parsedFile, schema } = get();

        if (!filePath) {
          // No file path, use Save As
          await get().saveConfigAs();
          return;
        }

        if (!schema || !parsedFile) {
          set({ error: 'Schema or parsed file not loaded' });
          return;
        }

        set({ isSaving: true, error: null });

        try {
          // Create backup
          await invoke('create_backup', { path: filePath });

          // Build save options with change tracking
          const propertyMap = createPropertyMap(schema);
          const modifiedKeys = new Set<string>();

          // Find all modified and new keys
          config.forEach((value, key) => {
            const originalValue = originalConfig.get(key);
            if (
              originalValue === undefined ||
              JSON.stringify(value) !== JSON.stringify(originalValue)
            ) {
              modifiedKeys.add(key);
            }
          });

          const saveOptions = buildSaveOptions(parsedFile, config, modifiedKeys, propertyMap);

          // Generate new config content
          const newContent = saveConfigFile(parsedFile, saveOptions);

          // Write to file
          await invoke('write_config_file', {
            path: filePath,
            content: newContent,
          });

          // Update state
          const newOriginalConfig = new Map(config);
          set({
            originalConfig: newOriginalConfig,
            lastSavedTimestamp: Date.now(),
            isSaving: false,
            error: null,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to save config';
          set({ error: message, isSaving: false });
        }
      },

      /**
       * Save config to a new file path
       */
      saveConfigAs: async () => {
        try {
          const selected = await save({
            filters: [
              {
                name: 'Config Files',
                extensions: ['properties', 'conf', 'config'],
              },
            ],
          });

          if (selected) {
            set({ filePath: selected });
            await get().saveConfig();
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to save file';
          set({ error: message });
        }
      },

      /**
       * Update a single property value
       */
      updateProperty: (key: string, value: string | string[]) => {
        const { config } = get();
        const newConfig = new Map(config);
        newConfig.set(key, value);
        set({ config: newConfig });
      },

      /**
       * Remove a property from config
       */
      removeProperty: (key: string) => {
        const { config } = get();
        const newConfig = new Map(config);
        newConfig.delete(key);
        set({ config: newConfig });
      },

      /**
       * Reset a property to its default value from schema
       */
      resetProperty: (key: string) => {
        const { schema, config } = get();
        if (!schema) return;

        const propertyMap = createPropertyMap(schema);
        const property = propertyMap.get(key);

        if (property) {
          const defaultValue = getDefaultValue(property);
          const newConfig = new Map(config);

          if (defaultValue === null) {
            newConfig.delete(key);
          } else {
            newConfig.set(key, defaultValue);
          }

          set({ config: newConfig });
        }
      },

      /**
       * Set active tab
       */
      setActiveTab: (tabId: string) => {
        set({ activeTab: tabId });
      },

      /**
       * Set active section
       */
      setActiveSection: (sectionId: string) => {
        set({ activeSection: sectionId });
      },

      /**
       * Get summary of changes
       */
      getChangeSummary: (): ChangeSummary => {
        const { config, originalConfig } = get();

        const modified: string[] = [];
        const added: string[] = [];
        const removed: string[] = [];

        // Check for modified and added properties
        config.forEach((value, key) => {
          const originalValue = originalConfig.get(key);

          if (originalValue === undefined) {
            added.push(key);
          } else if (JSON.stringify(value) !== JSON.stringify(originalValue)) {
            modified.push(key);
          }
        });

        // Check for removed properties
        originalConfig.forEach((_, key) => {
          if (!config.has(key)) {
            removed.push(key);
          }
        });

        return { modified, added, removed };
      },

      /**
       * Check if there are unsaved changes
       */
      hasUnsavedChanges: (): boolean => {
        const summary = get().getChangeSummary();
        return (
          summary.modified.length > 0 || summary.added.length > 0 || summary.removed.length > 0
        );
      },

      /**
       * Discard all changes and revert to original config
       */
      discardChanges: () => {
        const { originalConfig } = get();
        set({ config: new Map(originalConfig) });
      },
    }),
    {
      name: 'ghostty-config-store',
      partialize: state => ({
        lastFilePath: state.filePath,
        activeTab: state.activeTab,
        activeSection: state.activeSection,
      }),
    }
  )
);
