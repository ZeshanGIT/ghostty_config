/**
 * Schema Query Utilities
 *
 * Provides convenient query functions to search and retrieve
 * properties, sections, and tabs from the schema.
 */

import type { GhosttyConfigSchema, Tab, Section, ConfigProperty, Item } from '@/types/schema';
import { isConfigProperty, isCommentBlock } from '@/types/schema';

/**
 * Gets a config property by its key
 */
export function getPropertyByKey(schema: GhosttyConfigSchema, key: string): ConfigProperty | null {
  for (const tab of schema.tabs) {
    for (const section of tab.sections) {
      for (const item of section.keys) {
        if (isConfigProperty(item) && item.key === key) {
          return item;
        }
      }
    }
  }
  return null;
}

/**
 * Gets all config properties in a tab
 */
export function getPropertiesByTab(schema: GhosttyConfigSchema, tabId: string): ConfigProperty[] {
  const tab = schema.tabs.find(t => t.id === tabId);
  if (!tab) return [];

  const properties: ConfigProperty[] = [];

  for (const section of tab.sections) {
    for (const item of section.keys) {
      if (isConfigProperty(item)) {
        properties.push(item);
      }
    }
  }

  return properties;
}

/**
 * Gets all config properties in a section
 */
export function getPropertiesBySection(
  schema: GhosttyConfigSchema,
  tabId: string,
  sectionId: string
): ConfigProperty[] {
  const tab = schema.tabs.find(t => t.id === tabId);
  if (!tab) return [];

  const section = tab.sections.find(s => s.id === sectionId);
  if (!section) return [];

  const properties: ConfigProperty[] = [];

  for (const item of section.keys) {
    if (isConfigProperty(item)) {
      properties.push(item);
    }
  }

  return properties;
}

/**
 * Gets the comment block immediately before a property (if any)
 */
export function getCommentForProperty(schema: GhosttyConfigSchema, key: string): string | null {
  for (const tab of schema.tabs) {
    for (const section of tab.sections) {
      for (let i = 0; i < section.keys.length; i++) {
        const item = section.keys[i];

        // Found the property
        if (isConfigProperty(item) && item.key === key) {
          // Check if previous item is a comment
          const prevItem = section.keys[i - 1];
          if (i > 0 && isCommentBlock(prevItem)) {
            return prevItem.content;
          }
          return null;
        }
      }
    }
  }
  return null;
}

/**
 * Gets a tab by its ID
 */
export function getTabById(schema: GhosttyConfigSchema, tabId: string): Tab | null {
  return schema.tabs.find(t => t.id === tabId) || null;
}

/**
 * Gets a section by its ID (requires tab ID)
 */
export function getSectionById(
  schema: GhosttyConfigSchema,
  tabId: string,
  sectionId: string
): Section | null {
  const tab = getTabById(schema, tabId);
  if (!tab) return null;

  return tab.sections.find(s => s.id === sectionId) || null;
}

/**
 * Gets all properties with a specific value type
 */
export function getPropertiesByValueType(
  schema: GhosttyConfigSchema,
  valueType: ConfigProperty['valueType']
): ConfigProperty[] {
  const properties: ConfigProperty[] = [];

  for (const tab of schema.tabs) {
    for (const section of tab.sections) {
      for (const item of section.keys) {
        if (isConfigProperty(item) && item.valueType === valueType) {
          properties.push(item);
        }
      }
    }
  }

  return properties;
}

/**
 * Gets all properties for a specific platform
 */
export function getPropertiesByPlatform(
  schema: GhosttyConfigSchema,
  platform: 'macos' | 'linux' | 'windows'
): ConfigProperty[] {
  const properties: ConfigProperty[] = [];

  for (const tab of schema.tabs) {
    for (const section of tab.sections) {
      for (const item of section.keys) {
        if (isConfigProperty(item)) {
          // If no platforms specified, it's available on all platforms
          if (!item.platforms || item.platforms.includes(platform)) {
            properties.push(item);
          }
        }
      }
    }
  }

  return properties;
}

/**
 * Gets all repeatable properties
 */
export function getRepeatableProperties(schema: GhosttyConfigSchema): ConfigProperty[] {
  const properties: ConfigProperty[] = [];

  for (const tab of schema.tabs) {
    for (const section of tab.sections) {
      for (const item of section.keys) {
        if (isConfigProperty(item) && item.repeatable) {
          properties.push(item);
        }
      }
    }
  }

  return properties;
}

/**
 * Gets all required properties
 */
export function getRequiredProperties(schema: GhosttyConfigSchema): ConfigProperty[] {
  const properties: ConfigProperty[] = [];

  for (const tab of schema.tabs) {
    for (const section of tab.sections) {
      for (const item of section.keys) {
        if (isConfigProperty(item) && item.required) {
          properties.push(item);
        }
      }
    }
  }

  return properties;
}

/**
 * Searches properties by label or key (case-insensitive)
 */
export function searchProperties(schema: GhosttyConfigSchema, query: string): ConfigProperty[] {
  const lowerQuery = query.toLowerCase();
  const properties: ConfigProperty[] = [];

  for (const tab of schema.tabs) {
    for (const section of tab.sections) {
      for (const item of section.keys) {
        if (isConfigProperty(item)) {
          if (
            item.key.toLowerCase().includes(lowerQuery) ||
            item.label.toLowerCase().includes(lowerQuery)
          ) {
            properties.push(item);
          }
        }
      }
    }
  }

  return properties;
}

/**
 * Gets the tab and section for a property key
 */
export function getPropertyLocation(
  schema: GhosttyConfigSchema,
  key: string
): { tab: Tab; section: Section; property: ConfigProperty } | null {
  for (const tab of schema.tabs) {
    for (const section of tab.sections) {
      for (const item of section.keys) {
        if (isConfigProperty(item) && item.key === key) {
          return { tab, section, property: item };
        }
      }
    }
  }
  return null;
}

/**
 * Gets all items (comments and properties) in a section
 */
export function getSectionItems(
  schema: GhosttyConfigSchema,
  tabId: string,
  sectionId: string
): Item[] {
  const section = getSectionById(schema, tabId, sectionId);
  return section ? section.keys : [];
}

/**
 * Gets all comment blocks in the schema
 */
export function getAllComments(
  schema: GhosttyConfigSchema
): Array<{ content: string; tabId: string; sectionId: string }> {
  const comments: Array<{ content: string; tabId: string; sectionId: string }> = [];

  for (const tab of schema.tabs) {
    for (const section of tab.sections) {
      for (const item of section.keys) {
        if (isCommentBlock(item)) {
          comments.push({
            content: item.content,
            tabId: tab.id,
            sectionId: section.id,
          });
        }
      }
    }
  }

  return comments;
}

/**
 * Checks if a property exists
 */
export function hasProperty(schema: GhosttyConfigSchema, key: string): boolean {
  return getPropertyByKey(schema, key) !== null;
}

/**
 * Gets properties grouped by their value type
 */
export function groupPropertiesByValueType(
  schema: GhosttyConfigSchema
): Record<string, ConfigProperty[]> {
  const grouped: Record<string, ConfigProperty[]> = {};

  for (const tab of schema.tabs) {
    for (const section of tab.sections) {
      for (const item of section.keys) {
        if (isConfigProperty(item)) {
          const valueType = item.valueType;
          if (!grouped[valueType]) {
            grouped[valueType] = [];
          }
          grouped[valueType].push(item);
        }
      }
    }
  }

  return grouped;
}

/**
 * Gets properties grouped by tab
 */
export function groupPropertiesByTab(
  schema: GhosttyConfigSchema
): Record<string, ConfigProperty[]> {
  const grouped: Record<string, ConfigProperty[]> = {};

  for (const tab of schema.tabs) {
    grouped[tab.id] = getPropertiesByTab(schema, tab.id);
  }

  return grouped;
}

/**
 * Property map type for quick lookup
 */
export type PropertyMap = Map<string, ConfigProperty>;

/**
 * Creates a property map for O(1) lookups by key
 */
export function createPropertyMap(schema: GhosttyConfigSchema): PropertyMap {
  const map = new Map<string, ConfigProperty>();

  for (const tab of schema.tabs) {
    for (const section of tab.sections) {
      for (const item of section.keys) {
        if (isConfigProperty(item)) {
          map.set(item.key, item);
        }
      }
    }
  }

  return map;
}
