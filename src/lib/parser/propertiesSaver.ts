/**
 * Properties File Saver
 *
 * Saves Ghostty configuration files with "smart merge" - preserving the user's
 * original file structure, comments, and order while updating only modified values.
 */

import type { ParsedConfigFile } from '@/types/config';
import type { PropertyMap } from '@/types/schema';

export interface SaveOptions {
  /** Properties that have been modified (key -> new value) */
  modifiedProperties: Map<string, string | string[]>;
  /** Properties that should be removed */
  removedProperties: Set<string>;
  /** New properties to add (not in original file) */
  newProperties: Map<string, string | string[]>;
  /** Property schema map for validation */
  propertyMap?: PropertyMap;
}

/**
 * Save config file with smart merge
 *
 * This function implements the "surgical update" strategy:
 * - Preserves comments and blank lines
 * - Only updates modified property values
 * - Removes deleted properties
 * - Appends new properties at the end
 */
export function saveConfigFile(parsedFile: ParsedConfigFile, options: SaveOptions): string {
  const { modifiedProperties, removedProperties, newProperties, propertyMap } = options;

  const outputLines: string[] = [];
  const processedProperties = new Set<string>();

  // Process each line from the original file
  for (const line of parsedFile.lines) {
    if (line.type === 'comment' || line.type === 'blank') {
      // Preserve comments and blank lines as-is
      outputLines.push(line.content);
      continue;
    }

    if (line.type === 'unknown') {
      // Preserve unknown lines as-is
      outputLines.push(line.content);
      continue;
    }

    if (line.type === 'property' && line.key) {
      const key = line.key;

      // Check if property should be removed
      if (removedProperties.has(key)) {
        // Skip this line (remove the property)
        continue;
      }

      // Check if property has been modified
      if (modifiedProperties.has(key)) {
        const newValue = modifiedProperties.get(key)!;
        const propertyDef = propertyMap?.get(key);
        const isRepeatable = propertyDef?.isRepeatable || false;

        if (isRepeatable && Array.isArray(newValue)) {
          // Repeatable property - handle specially
          if (!processedProperties.has(key)) {
            // First occurrence - output all values
            for (const value of newValue) {
              outputLines.push(`${key} = ${value}`);
            }
            processedProperties.add(key);
          }
          // Skip subsequent occurrences (we already output all values)
          continue;
        } else if (!isRepeatable) {
          // Non-repeatable property - update value
          const value = Array.isArray(newValue) ? newValue[0] : newValue;
          outputLines.push(`${key} = ${value}`);
          processedProperties.add(key);
          continue;
        }
      }

      // Property not modified - keep original line
      outputLines.push(line.content);
      processedProperties.add(key);
    }
  }

  // Append new properties at the end
  if (newProperties.size > 0) {
    // Add a blank line before new properties (if file doesn't end with one)
    if (outputLines.length > 0 && outputLines[outputLines.length - 1].trim()) {
      outputLines.push('');
    }

    // Add comment header for new properties
    outputLines.push('# Properties added by Ghostty Config Editor');

    for (const [key, value] of newProperties) {
      const propertyDef = propertyMap?.get(key);
      const isRepeatable = propertyDef?.isRepeatable || false;

      if (isRepeatable && Array.isArray(value)) {
        // Add all values for repeatable property
        for (const v of value) {
          outputLines.push(`${key} = ${v}`);
        }
      } else {
        // Add single value
        const v = Array.isArray(value) ? value[0] : value;
        outputLines.push(`${key} = ${v}`);
      }
    }
  }

  // Join with newlines and ensure file ends with newline
  const result = outputLines.join('\n');
  return result.endsWith('\n') ? result : result + '\n';
}

/**
 * Build SaveOptions from current state and original parsed file
 */
export function buildSaveOptions(
  originalParsedFile: ParsedConfigFile,
  currentConfig: Map<string, string | string[]>,
  modifiedKeys: Set<string>,
  propertyMap?: PropertyMap
): SaveOptions {
  const originalConfig = originalParsedFile.parseResult.valid;
  const modifiedProperties = new Map<string, string | string[]>();
  const removedProperties = new Set<string>();
  const newProperties = new Map<string, string | string[]>();

  // Find modified properties
  for (const key of modifiedKeys) {
    if (currentConfig.has(key)) {
      const currentValue = currentConfig.get(key)!;
      modifiedProperties.set(key, currentValue);
    }
  }

  // Find removed properties (existed in original, but not in current)
  for (const key of originalConfig.keys()) {
    if (!currentConfig.has(key)) {
      removedProperties.add(key);
    }
  }

  // Find new properties (exist in current, but not in original)
  for (const [key, value] of currentConfig) {
    if (!originalConfig.has(key)) {
      newProperties.set(key, value);
    }
  }

  return {
    modifiedProperties,
    removedProperties,
    newProperties,
    propertyMap,
  };
}

/**
 * Create a diff summary of changes
 */
export interface ChangeSummary {
  modified: string[];
  added: string[];
  removed: string[];
  total: number;
}

export function getChangeSummary(options: SaveOptions): ChangeSummary {
  const modified = Array.from(options.modifiedProperties.keys());
  const added = Array.from(options.newProperties.keys());
  const removed = Array.from(options.removedProperties);

  return {
    modified,
    added,
    removed,
    total: modified.length + added.length + removed.length,
  };
}

/**
 * Format a change summary for display
 */
export function formatChangeSummary(summary: ChangeSummary): string {
  const parts: string[] = [];

  if (summary.modified.length > 0) {
    parts.push(`${summary.modified.length} modified`);
  }

  if (summary.added.length > 0) {
    parts.push(`${summary.added.length} added`);
  }

  if (summary.removed.length > 0) {
    parts.push(`${summary.removed.length} removed`);
  }

  if (parts.length === 0) {
    return 'No changes';
  }

  return parts.join(', ');
}
