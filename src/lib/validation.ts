/**
 * Validation Utilities
 *
 * Validate property values against the Ghostty configuration schema
 */

import type { ConfigProperty } from '@/types/schema';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a property value against its schema definition
 */
export function validateProperty(property: ConfigProperty, value: string): ValidationResult {
  // Empty value validation
  if (!value || value.trim() === '') {
    return { valid: true }; // Empty values are allowed (will use default)
  }

  const trimmedValue = value.trim();

  // Type-specific validation
  switch (property.type) {
    case 'number':
      return validateNumber(property, trimmedValue);

    case 'boolean':
      return validateBoolean(trimmedValue);

    case 'enum':
      return validateEnum(property, trimmedValue);

    case 'string':
    case 'repeatable':
      return validateString(property, trimmedValue);

    default:
      return { valid: true };
  }
}

/**
 * Validate a number value
 */
function validateNumber(property: ConfigProperty, value: string): ValidationResult {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return {
      valid: false,
      error: `Expected a number, got '${value}'`,
    };
  }

  if (property.validation?.min !== undefined && num < property.validation.min) {
    return {
      valid: false,
      error: `Value ${num} is below minimum ${property.validation.min}`,
    };
  }

  if (property.validation?.max !== undefined && num > property.validation.max) {
    return {
      valid: false,
      error: `Value ${num} is above maximum ${property.validation.max}`,
    };
  }

  return { valid: true };
}

/**
 * Validate a boolean value
 */
function validateBoolean(value: string): ValidationResult {
  const lower = value.toLowerCase();

  if (lower !== 'true' && lower !== 'false') {
    return {
      valid: false,
      error: `Expected 'true' or 'false', got '${value}'`,
    };
  }

  return { valid: true };
}

/**
 * Validate an enum value
 */
function validateEnum(property: ConfigProperty, value: string): ValidationResult {
  if (!property.validation?.enum) {
    return { valid: true };
  }

  if (!property.validation.enum.includes(value)) {
    return {
      valid: false,
      error: `Value '${value}' is not one of: ${property.validation.enum.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate a string value
 */
function validateString(property: ConfigProperty, value: string): ValidationResult {
  if (property.validation?.pattern) {
    try {
      const regex = new RegExp(property.validation.pattern);
      if (!regex.test(value)) {
        return {
          valid: false,
          error: `Value '${value}' doesn't match required pattern`,
        };
      }
    } catch {
      // Invalid regex in schema - skip validation
      console.warn(
        `Invalid regex pattern in schema for ${property.key}:`,
        property.validation.pattern
      );
    }
  }

  return { valid: true };
}

/**
 * Get a user-friendly type description
 */
export function getTypeDescription(property: ConfigProperty): string {
  switch (property.type) {
    case 'number':
      if (property.validation?.min !== undefined && property.validation?.max !== undefined) {
        return `Number (${property.validation.min}-${property.validation.max})`;
      } else if (property.validation?.min !== undefined) {
        return `Number (≥ ${property.validation.min})`;
      } else if (property.validation?.max !== undefined) {
        return `Number (≤ ${property.validation.max})`;
      }
      return 'Number';

    case 'boolean':
      return 'Boolean (true/false)';

    case 'enum':
      if (property.validation?.enum) {
        return `One of: ${property.validation.enum.join(', ')}`;
      }
      return 'Enum';

    case 'string':
      return 'String';

    case 'repeatable':
      return 'Repeatable property';

    default:
      return property.type;
  }
}

/**
 * Format a default value for display
 */
export function formatDefaultValue(property: ConfigProperty): string {
  if (property.defaultValue === null || property.defaultValue === '') {
    return 'None (use Ghostty default)';
  }

  return property.defaultValue;
}
