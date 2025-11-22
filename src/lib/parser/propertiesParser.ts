/**
 * Properties File Parser
 *
 * Parses Ghostty configuration files (.properties format) with full preservation
 * of comments, blank lines, and unknown properties.
 */

import type {
  ConfigLine,
  ParseResult,
  ParsedConfigFile,
  InvalidLine,
  ConfigWarning,
} from '@/types/config';
import type { PropertyMap } from '@/lib/schemaQueries';
import type { ConfigProperty } from '@/types/schema';

/**
 * Parse a single line from a config file
 */
function parseLine(line: string, lineNumber: number, propertyMap?: PropertyMap): ConfigLine {
  const trimmed = line.trim();

  // Blank line
  if (!trimmed) {
    return {
      type: 'blank',
      content: line,
      lineNumber,
      raw: line,
    };
  }

  // Comment line
  if (trimmed.startsWith('#')) {
    return {
      type: 'comment',
      content: line,
      lineNumber,
      raw: line,
    };
  }

  // Property line: key = value
  const equalIndex = line.indexOf('=');
  if (equalIndex === -1) {
    // No equals sign - treat as unknown/invalid
    return {
      type: 'unknown',
      content: line,
      lineNumber,
      raw: line,
    };
  }

  const key = line.substring(0, equalIndex).trim();
  const value = line.substring(equalIndex + 1).trim();

  // Check if property exists in schema
  const isKnown = propertyMap ? propertyMap.has(key) : true;

  return {
    type: isKnown ? 'property' : 'unknown',
    content: line,
    lineNumber,
    key,
    value,
    raw: line,
  };
}

/**
 * Parse a complete config file
 */
export function parseConfigFile(content: string, propertyMap?: PropertyMap): ParsedConfigFile {
  const lines: ConfigLine[] = [];
  const valid = new Map<string, string | string[]>();
  const invalid: InvalidLine[] = [];
  const warnings: ConfigWarning[] = [];
  const unknownProperties = new Map<string, string>();
  const propMap = new Map<string, number[]>();

  const fileLines = content.split('\n');

  for (let i = 0; i < fileLines.length; i++) {
    const lineNumber = i + 1;
    const lineText = fileLines[i];
    const parsedLine = parseLine(lineText, lineNumber, propertyMap);

    lines.push(parsedLine);

    if (parsedLine.type === 'property' && parsedLine.key) {
      const { key, value } = parsedLine;

      // Track line numbers for this property
      if (!propMap.has(key)) {
        propMap.set(key, []);
      }
      propMap.get(key)!.push(lineNumber);

      // Check if property is repeatable
      const propertyDef = propertyMap?.get(key);
      const isRepeatable = propertyDef?.repeatable || false;

      if (isRepeatable) {
        // Repeatable property - store as array
        if (!valid.has(key)) {
          valid.set(key, []);
        }
        (valid.get(key) as string[]).push(value || '');
      } else {
        // Non-repeatable property
        if (valid.has(key)) {
          // Duplicate property - warn
          warnings.push({
            type: 'parse-error',
            lineNumber,
            key,
            message: `Duplicate property '${key}' found (first defined at line ${propMap.get(key)![0]})`,
          });
        }
        valid.set(key, value || '');
      }

      // Validate property value if we have schema
      if (propertyDef && value) {
        const validationError = validatePropertyValue(propertyDef, value);
        if (validationError) {
          warnings.push({
            type: 'validation-error',
            lineNumber,
            key,
            message: validationError,
          });
        }
      }
    } else if (parsedLine.type === 'unknown' && parsedLine.key) {
      // Unknown property - preserve with warning
      const { key, value } = parsedLine;
      unknownProperties.set(key, value || '');
      warnings.push({
        type: 'unknown-property',
        lineNumber,
        key,
        message: `Unknown property '${key}' (not in schema)`,
      });
    } else if (parsedLine.type === 'unknown' && !parsedLine.key && parsedLine.content.trim()) {
      // Invalid line format
      invalid.push({
        lineNumber,
        content: parsedLine.content,
        error: 'Invalid line format (expected: key = value)',
      });
    }
  }

  const parseResult: ParseResult = {
    lines,
    valid,
    invalid,
    warnings,
    unknownProperties,
  };

  return {
    lines,
    propertyMap: propMap,
    parseResult,
  };
}

/**
 * Validate a property value against its schema definition
 */
function validatePropertyValue(propertyDef: ConfigProperty, value: string): string | null {
  const { valueType, validation } = propertyDef;

  // Type validation
  if (valueType === 'number') {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return `Expected a number, got '${value}'`;
    }

    if (validation && 'min' in validation && validation.min !== undefined && num < validation.min) {
      return `Value ${num} is below minimum ${validation.min}`;
    }

    if (validation && 'max' in validation && validation.max !== undefined && num > validation.max) {
      return `Value ${num} is above maximum ${validation.max}`;
    }
  }

  if (valueType === 'boolean') {
    const lower = value.toLowerCase();
    if (lower !== 'true' && lower !== 'false') {
      return `Expected 'true' or 'false', got '${value}'`;
    }
  }

  if (valueType === 'enum' && propertyDef.valueType === 'enum') {
    const enumValues = propertyDef.options.values.map(v => v.value);
    if (!propertyDef.options.allowCustom && !enumValues.includes(value)) {
      return `Value '${value}' is not one of: ${enumValues.join(', ')}`;
    }
  }

  // Pattern validation (for text types)
  if (
    valueType === 'text' &&
    propertyDef.valueType === 'text' &&
    validation &&
    'pattern' in validation &&
    validation.pattern
  ) {
    try {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return `Value '${value}' doesn't match required pattern`;
      }
    } catch {
      // Invalid regex in schema - skip validation
    }
  }

  return null;
}

/**
 * Get property value from parsed config
 */
export function getPropertyValue(
  parsedFile: ParsedConfigFile,
  key: string
): string | string[] | undefined {
  return parsedFile.parseResult.valid.get(key);
}

/**
 * Check if a property exists in parsed config
 */
export function hasProperty(parsedFile: ParsedConfigFile, key: string): boolean {
  return parsedFile.parseResult.valid.has(key);
}

/**
 * Get all property keys from parsed config
 */
export function getAllPropertyKeys(parsedFile: ParsedConfigFile): string[] {
  return Array.from(parsedFile.parseResult.valid.keys());
}

/**
 * Get all warnings from parsed config
 */
export function getWarnings(parsedFile: ParsedConfigFile): ConfigWarning[] {
  return parsedFile.parseResult.warnings;
}

/**
 * Get all invalid lines from parsed config
 */
export function getInvalidLines(parsedFile: ParsedConfigFile): InvalidLine[] {
  return parsedFile.parseResult.invalid;
}

/**
 * Get unknown properties from parsed config
 */
export function getUnknownProperties(parsedFile: ParsedConfigFile): Map<string, string> {
  return parsedFile.parseResult.unknownProperties;
}
