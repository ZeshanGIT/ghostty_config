/**
 * Schema Loader Utility
 *
 * Loads and validates the Ghostty configuration schema from JSON.
 * Provides typed access to the schema with runtime validation.
 */

import type { GhosttyConfigSchema, Tab, Section, Item, ConfigProperty } from '@/types/schema';
import schemaJson from '../../ghosttyConfigSchema.json';

/**
 * Validation error type
 */
export class SchemaValidationError extends Error {
  constructor(
    message: string,
    public path?: string
  ) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}

/**
 * Validates the basic structure of the schema
 */
function validateSchemaStructure(data: unknown): asserts data is GhosttyConfigSchema {
  if (!data || typeof data !== 'object') {
    throw new SchemaValidationError('Schema must be an object');
  }

  const schema = data as Record<string, unknown>;

  // Validate version
  if (typeof schema.version !== 'string') {
    throw new SchemaValidationError('Schema must have a version string', 'version');
  }

  // Validate ghosttyVersion
  if (typeof schema.ghosttyVersion !== 'string') {
    throw new SchemaValidationError('Schema must have a ghosttyVersion string', 'ghosttyVersion');
  }

  // Validate tabs
  if (!Array.isArray(schema.tabs)) {
    throw new SchemaValidationError('Schema must have a tabs array', 'tabs');
  }

  // Validate each tab
  schema.tabs.forEach((tab, tabIndex) => {
    validateTab(tab, `tabs[${tabIndex}]`);
  });
}

/**
 * Validates a tab structure
 */
function validateTab(tab: unknown, path: string): asserts tab is Tab {
  if (!tab || typeof tab !== 'object') {
    throw new SchemaValidationError('Tab must be an object', path);
  }

  const t = tab as Record<string, unknown>;

  if (typeof t.id !== 'string') {
    throw new SchemaValidationError('Tab must have an id string', `${path}.id`);
  }

  if (typeof t.label !== 'string') {
    throw new SchemaValidationError('Tab must have a label string', `${path}.label`);
  }

  if (!Array.isArray(t.sections)) {
    throw new SchemaValidationError('Tab must have a sections array', `${path}.sections`);
  }

  // Validate each section
  t.sections.forEach((section, sectionIndex) => {
    validateSection(section, `${path}.sections[${sectionIndex}]`);
  });
}

/**
 * Validates a section structure
 */
function validateSection(section: unknown, path: string): asserts section is Section {
  if (!section || typeof section !== 'object') {
    throw new SchemaValidationError('Section must be an object', path);
  }

  const s = section as Record<string, unknown>;

  if (typeof s.id !== 'string') {
    throw new SchemaValidationError('Section must have an id string', `${path}.id`);
  }

  if (typeof s.label !== 'string') {
    throw new SchemaValidationError('Section must have a label string', `${path}.label`);
  }

  if (!Array.isArray(s.keys)) {
    throw new SchemaValidationError('Section must have a keys array', `${path}.keys`);
  }

  // Validate each item
  s.keys.forEach((item, itemIndex) => {
    validateItem(item, `${path}.keys[${itemIndex}]`);
  });
}

/**
 * Validates an item (comment or config property)
 */
function validateItem(item: unknown, path: string): asserts item is Item {
  if (!item || typeof item !== 'object') {
    throw new SchemaValidationError('Item must be an object', path);
  }

  const i = item as Record<string, unknown>;

  if (i.type !== 'comment' && i.type !== 'config') {
    throw new SchemaValidationError('Item type must be "comment" or "config"', `${path}.type`);
  }

  if (i.type === 'comment') {
    if (typeof i.content !== 'string') {
      throw new SchemaValidationError('Comment must have content string', `${path}.content`);
    }
  } else if (i.type === 'config') {
    validateConfigProperty(item as ConfigProperty, path);
  }
}

/**
 * Validates a config property
 */
function validateConfigProperty(prop: unknown, path: string): asserts prop is ConfigProperty {
  if (!prop || typeof prop !== 'object') {
    throw new SchemaValidationError('Config property must be an object', path);
  }

  const p = prop as Record<string, unknown>;

  if (typeof p.key !== 'string') {
    throw new SchemaValidationError('Config property must have a key string', `${path}.key`);
  }

  if (typeof p.label !== 'string') {
    throw new SchemaValidationError('Config property must have a label string', `${path}.label`);
  }

  if (typeof p.valueType !== 'string') {
    throw new SchemaValidationError(
      'Config property must have a valueType string',
      `${path}.valueType`
    );
  }

  if (typeof p.required !== 'boolean') {
    throw new SchemaValidationError(
      'Config property must have a required boolean',
      `${path}.required`
    );
  }

  if (typeof p.repeatable !== 'boolean') {
    throw new SchemaValidationError(
      'Config property must have a repeatable boolean',
      `${path}.repeatable`
    );
  }

  // Validate valueType is one of the known types
  const validValueTypes = [
    'text',
    'number',
    'boolean',
    'enum',
    'opacity',
    'filepath',
    'color',
    'keybinding',
    'command',
    'adjustment',
    'padding',
    'font-style',
    'repeatable-text',
    'special-number',
    'font-family',
  ];

  if (!validValueTypes.includes(p.valueType as string)) {
    throw new SchemaValidationError(
      `Invalid valueType: ${p.valueType}. Must be one of: ${validValueTypes.join(', ')}`,
      `${path}.valueType`
    );
  }
}

/**
 * Loaded and validated schema instance
 */
let cachedSchema: GhosttyConfigSchema | null = null;

/**
 * Loads the Ghostty configuration schema from JSON
 *
 * @returns Validated and typed schema object
 * @throws SchemaValidationError if schema is invalid
 */
export function loadSchema(): GhosttyConfigSchema {
  // Return cached schema if already loaded
  if (cachedSchema) {
    return cachedSchema;
  }

  try {
    // Validate structure
    validateSchemaStructure(schemaJson);

    // Cache and return
    cachedSchema = schemaJson as GhosttyConfigSchema;
    return cachedSchema;
  } catch (error) {
    if (error instanceof SchemaValidationError) {
      throw error;
    }
    throw new SchemaValidationError(`Failed to load schema: ${error}`);
  }
}

/**
 * Gets schema statistics
 */
export function getSchemaStats(schema: GhosttyConfigSchema) {
  let totalProperties = 0;
  let totalComments = 0;
  let totalSections = 0;

  const valueTypeCounts: Record<string, number> = {};

  schema.tabs.forEach(tab => {
    totalSections += tab.sections.length;

    tab.sections.forEach(section => {
      section.keys.forEach(item => {
        if (item.type === 'comment') {
          totalComments++;
        } else if (item.type === 'config') {
          totalProperties++;

          // Count value types
          const valueType = item.valueType;
          valueTypeCounts[valueType] = (valueTypeCounts[valueType] || 0) + 1;
        }
      });
    });
  });

  return {
    tabs: schema.tabs.length,
    sections: totalSections,
    properties: totalProperties,
    comments: totalComments,
    valueTypes: valueTypeCounts,
  };
}

/**
 * Clears the cached schema (useful for testing)
 */
export function clearSchemaCache(): void {
  cachedSchema = null;
}
