/**
 * Schema Validation Utilities
 *
 * Provides validation functions for each value type in the schema.
 * These validators check if a given value is valid according to the schema rules.
 */

import type {
  ConfigProperty,
  TextProperty,
  NumberProperty,
  BooleanProperty,
  EnumProperty,
  OpacityProperty,
  FilePathProperty,
  ColorProperty,
  KeybindingProperty,
  CommandProperty,
  AdjustmentProperty,
  PaddingProperty,
  FontStyleProperty,
  RepeatableTextProperty,
  SpecialNumberProperty,
  FontFamilyProperty,
} from '@/types/schema';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Creates a successful validation result
 */
function success(): ValidationResult {
  return { valid: true, errors: [] };
}

/**
 * Creates a failed validation result
 */
function failure(...errors: string[]): ValidationResult {
  return { valid: false, errors };
}

/**
 * Validates a text property value
 */
export function validateText(value: string, property: TextProperty): ValidationResult {
  const { validation } = property;

  if (!validation) {
    return success();
  }

  const errors: string[] = [];

  // Check min length
  if (validation.minLength !== undefined && value.length < validation.minLength) {
    errors.push(`Must be at least ${validation.minLength} characters`);
  }

  // Check max length
  if (validation.maxLength !== undefined && value.length > validation.maxLength) {
    errors.push(`Must be at most ${validation.maxLength} characters`);
  }

  // Check pattern
  if (validation.pattern) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(value)) {
      errors.push(`Must match pattern: ${validation.pattern}`);
    }
  }

  // Check format
  if (validation.format) {
    switch (validation.format) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push('Must be a valid email address');
        }
        break;
      case 'url':
        try {
          new URL(value);
        } catch {
          errors.push('Must be a valid URL');
        }
        break;
      case 'hex-color':
        if (!/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(value)) {
          errors.push('Must be a valid hex color (e.g., #RRGGBB or #RRGGBBAA)');
        }
        break;
    }
  }

  return errors.length > 0 ? failure(...errors) : success();
}

/**
 * Validates a number property value
 */
export function validateNumber(value: number, property: NumberProperty): ValidationResult {
  const { validation } = property;

  if (!validation) {
    return success();
  }

  const errors: string[] = [];

  // Check min
  if (validation.min !== undefined && value < validation.min) {
    errors.push(`Must be at least ${validation.min}`);
  }

  // Check max
  if (validation.max !== undefined && value > validation.max) {
    errors.push(`Must be at most ${validation.max}`);
  }

  // Check integer
  if (validation.integer && !Number.isInteger(value)) {
    errors.push('Must be a whole number');
  }

  // Check positive
  if (validation.positive && value <= 0) {
    errors.push('Must be positive');
  }

  // Check multipleOf
  if (validation.multipleOf !== undefined && value % validation.multipleOf !== 0) {
    errors.push(`Must be a multiple of ${validation.multipleOf}`);
  }

  return errors.length > 0 ? failure(...errors) : success();
}

/**
 * Validates a boolean property value
 */
export function validateBoolean(value: boolean, _property: BooleanProperty): ValidationResult {
  if (typeof value !== 'boolean') {
    return failure('Must be true or false');
  }
  return success();
}

/**
 * Validates an enum property value
 */
export function validateEnum(value: string | string[], property: EnumProperty): ValidationResult {
  const { options, validation } = property;
  const errors: string[] = [];

  const values = Array.isArray(value) ? value : [value];

  // Check min/max items for multiselect
  if (options.multiselect && validation) {
    if (validation.minItems !== undefined && values.length < validation.minItems) {
      errors.push(`Must select at least ${validation.minItems} items`);
    }
    if (validation.maxItems !== undefined && values.length > validation.maxItems) {
      errors.push(`Must select at most ${validation.maxItems} items`);
    }
  }

  // Check each value
  const allowedValues = options.values.map(v => v.value);
  const caseSensitive = validation?.caseSensitive ?? false;

  for (const v of values) {
    const matchValue = caseSensitive ? v : v.toLowerCase();
    const allowedMatch = caseSensitive ? allowedValues : allowedValues.map(av => av.toLowerCase());

    if (!allowedMatch.includes(matchValue)) {
      if (!options.allowCustom) {
        errors.push(`Invalid value: "${v}". Must be one of: ${allowedValues.join(', ')}`);
      } else if (validation?.customPattern) {
        const regex = new RegExp(validation.customPattern);
        if (!regex.test(v)) {
          errors.push(`Custom value "${v}" must match pattern: ${validation.customPattern}`);
        }
      }
    }
  }

  return errors.length > 0 ? failure(...errors) : success();
}

/**
 * Validates an opacity property value
 */
export function validateOpacity(value: number, property: OpacityProperty): ValidationResult {
  const { options } = property;
  const errors: string[] = [];

  if (value < options.min || value > options.max) {
    errors.push(`Must be between ${options.min} and ${options.max}`);
  }

  return errors.length > 0 ? failure(...errors) : success();
}

/**
 * Validates a filepath property value
 */
export function validateFilePath(value: string, property: FilePathProperty): ValidationResult {
  const { validation } = property;

  if (!validation) {
    return success();
  }

  const errors: string[] = [];

  // Check extensions
  if (validation.extensions && validation.extensions.length > 0) {
    const hasValidExtension = validation.extensions.some(ext => value.endsWith(ext));
    if (!hasValidExtension) {
      errors.push(`Must have one of these extensions: ${validation.extensions.join(', ')}`);
    }
  }

  // Note: File existence and readability checks should be done separately
  // as they require filesystem access

  return errors.length > 0 ? failure(...errors) : success();
}

/**
 * Validates a color property value
 */
export function validateColor(value: string, property: ColorProperty): ValidationResult {
  const { validation, options } = property;
  const errors: string[] = [];

  // Check special values
  if (validation?.allowSpecialValues && validation.allowSpecialValues.includes(value)) {
    return success();
  }

  // Check palette restriction
  if (validation?.paletteOnly && !validation.paletteOnly.includes(value)) {
    errors.push(`Must be one of: ${validation.paletteOnly.join(', ')}`);
    return failure(...errors);
  }

  // Validate based on format
  const format = options?.format || 'hex';

  switch (format) {
    case 'hex':
      if (!/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(value)) {
        errors.push('Must be a valid hex color (e.g., #RRGGBB or #RRGGBBAA)');
      }
      if (!validation?.allowTransparent && value.length === 9) {
        errors.push('Transparency not allowed');
      }
      break;

    case 'rgb':
    case 'rgba':
      // Basic RGB validation
      if (!/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*[\d.]+)?\s*\)$/i.test(value)) {
        errors.push('Must be a valid RGB color (e.g., rgb(255, 0, 0))');
      }
      break;

    case 'named':
      // X11 color names - basic validation
      if (!/^[a-z]+$/i.test(value)) {
        errors.push('Must be a valid color name');
      }
      break;
  }

  return errors.length > 0 ? failure(...errors) : success();
}

/**
 * Validates a keybinding property value
 */
export function validateKeybinding(value: string, property: KeybindingProperty): ValidationResult {
  const { validation } = property;

  if (!validation) {
    return success();
  }

  const errors: string[] = [];

  // Check for forbidden keys
  if (validation.forbiddenKeys) {
    const lowerValue = value.toLowerCase();
    for (const forbidden of validation.forbiddenKeys) {
      if (lowerValue.includes(forbidden.toLowerCase())) {
        errors.push(`Cannot use forbidden key: ${forbidden}`);
      }
    }
  }

  // Check for required modifier
  if (validation.requireModifier) {
    const hasModifier = /\b(ctrl|cmd|alt|shift|super)\b/i.test(value);
    if (!hasModifier) {
      errors.push('Must include a modifier key (Ctrl, Cmd, Alt, Shift, or Super)');
    }
  }

  return errors.length > 0 ? failure(...errors) : success();
}

/**
 * Validates a command property value
 */
export function validateCommand(value: string, property: CommandProperty): ValidationResult {
  const { validation } = property;

  if (!validation) {
    return success();
  }

  const errors: string[] = [];

  // Check allowed commands
  if (validation.allowedCommands && !validation.allowedCommands.includes(value)) {
    errors.push(`Must be one of: ${validation.allowedCommands.join(', ')}`);
  }

  // Check pattern
  if (validation.pattern) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(value)) {
      errors.push(`Must match pattern: ${validation.pattern}`);
    }
  }

  return errors.length > 0 ? failure(...errors) : success();
}

/**
 * Validates an adjustment property value
 */
export function validateAdjustment(value: string, property: AdjustmentProperty): ValidationResult {
  const { validation } = property;

  if (!validation) {
    return success();
  }

  const errors: string[] = [];

  // Check if it's a percentage
  if (value.endsWith('%')) {
    if (!validation.allowPercentage) {
      errors.push('Percentage values not allowed');
    } else {
      const numValue = parseFloat(value);
      if (validation.minPercentage !== undefined && numValue < validation.minPercentage) {
        errors.push(`Percentage must be at least ${validation.minPercentage}%`);
      }
      if (validation.maxPercentage !== undefined && numValue > validation.maxPercentage) {
        errors.push(`Percentage must be at most ${validation.maxPercentage}%`);
      }
    }
  } else {
    // It's an integer
    if (!validation.allowInteger) {
      errors.push('Integer values not allowed');
    } else {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue)) {
        errors.push('Must be a valid number or percentage');
      }
      if (validation.minInteger !== undefined && numValue < validation.minInteger) {
        errors.push(`Integer must be at least ${validation.minInteger}`);
      }
      if (validation.maxInteger !== undefined && numValue > validation.maxInteger) {
        errors.push(`Integer must be at most ${validation.maxInteger}`);
      }
    }
  }

  return errors.length > 0 ? failure(...errors) : success();
}

/**
 * Validates a padding property value
 */
export function validatePadding(value: string, property: PaddingProperty): ValidationResult {
  const { validation } = property;

  if (!validation) {
    return success();
  }

  const errors: string[] = [];

  // Check if it's a pair
  const isPair = value.includes(',');

  if (isPair && !validation.allowPair) {
    errors.push('Pair values not allowed');
    return failure(...errors);
  }

  // Parse values
  const values = isPair ? value.split(',').map(v => parseInt(v.trim(), 10)) : [parseInt(value, 10)];

  // Validate each value
  for (const v of values) {
    if (isNaN(v)) {
      errors.push('All values must be valid numbers');
      break;
    }
    if (validation.min !== undefined && v < validation.min) {
      errors.push(`Values must be at least ${validation.min}`);
    }
    if (validation.max !== undefined && v > validation.max) {
      errors.push(`Values must be at most ${validation.max}`);
    }
  }

  return errors.length > 0 ? failure(...errors) : success();
}

/**
 * Validates a font-style property value
 */
export function validateFontStyle(value: string, property: FontStyleProperty): ValidationResult {
  const { validation } = property;

  if (!validation) {
    return success();
  }

  const errors: string[] = [];

  // Check if disabled
  if (value === 'false' && !validation.allowDisable) {
    errors.push('Cannot disable this font style');
  }

  // Check if default
  if (value === 'default' && !validation.allowDefault) {
    errors.push('Cannot use default value');
  }

  // Check allowed style names
  if (
    validation.styleNames &&
    !validation.styleNames.includes(value) &&
    value !== 'false' &&
    value !== 'default'
  ) {
    errors.push(`Must be one of: ${validation.styleNames.join(', ')}, or "default"`);
  }

  return errors.length > 0 ? failure(...errors) : success();
}

/**
 * Validates a repeatable-text property value
 */
export function validateRepeatableText(
  values: string[],
  property: RepeatableTextProperty
): ValidationResult {
  const { validation, options } = property;

  // Check if empty is allowed
  if (values.length === 0 || (values.length === 1 && values[0] === '')) {
    if (options?.allowEmpty) {
      return success();
    }
    return failure('At least one value required');
  }

  // Validate each value
  for (const value of values) {
    if (!validation) continue;

    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return failure(`Value "${value}" must match pattern: ${validation.pattern}`);
      }
    }

    if (validation.minLength !== undefined && value.length < validation.minLength) {
      return failure(`Each value must be at least ${validation.minLength} characters`);
    }

    if (validation.maxLength !== undefined && value.length > validation.maxLength) {
      return failure(`Each value must be at most ${validation.maxLength} characters`);
    }
  }

  return success();
}

/**
 * Validates a special-number property value
 */
export function validateSpecialNumber(
  value: string | number | boolean,
  property: SpecialNumberProperty
): ValidationResult {
  const { validation, options } = property;

  // Allow boolean if specified
  if (typeof value === 'boolean' && options?.allowBoolean) {
    return success();
  }

  // If it's a number, validate as number
  if (typeof value === 'number') {
    if (!validation) {
      return success();
    }

    const errors: string[] = [];

    if (validation.min !== undefined && value < validation.min) {
      errors.push(`Must be at least ${validation.min}`);
    }
    if (validation.max !== undefined && value > validation.max) {
      errors.push(`Must be at most ${validation.max}`);
    }
    if (validation.integer && !Number.isInteger(value)) {
      errors.push('Must be a whole number');
    }

    return errors.length > 0 ? failure(...errors) : success();
  }

  // String value - could be special format
  return success(); // Special formats are validated separately based on the specific property
}

/**
 * Validates a font-family property value
 */
export function validateFontFamily(value: string, property: FontFamilyProperty): ValidationResult {
  const { validation } = property;

  // Empty string resets the font family
  if (value === '') {
    return success();
  }

  if (!validation) {
    return success();
  }

  const errors: string[] = [];

  if (validation.pattern) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(value)) {
      errors.push(`Must match pattern: ${validation.pattern}`);
    }
  }

  return errors.length > 0 ? failure(...errors) : success();
}

/**
 * Validates a value against its property definition
 * (Auto-detects property type and calls appropriate validator)
 */
export function validateValue(value: unknown, property: ConfigProperty): ValidationResult {
  switch (property.valueType) {
    case 'text':
      return validateText(String(value), property as TextProperty);
    case 'number':
      return validateNumber(Number(value), property as NumberProperty);
    case 'boolean':
      return validateBoolean(Boolean(value), property as BooleanProperty);
    case 'enum':
      return validateEnum(value as string | string[], property as EnumProperty);
    case 'opacity':
      return validateOpacity(Number(value), property as OpacityProperty);
    case 'filepath':
      return validateFilePath(String(value), property as FilePathProperty);
    case 'color':
      return validateColor(String(value), property as ColorProperty);
    case 'keybinding':
      return validateKeybinding(String(value), property as KeybindingProperty);
    case 'command':
      return validateCommand(String(value), property as CommandProperty);
    case 'adjustment':
      return validateAdjustment(String(value), property as AdjustmentProperty);
    case 'padding':
      return validatePadding(String(value), property as PaddingProperty);
    case 'font-style':
      return validateFontStyle(String(value), property as FontStyleProperty);
    case 'repeatable-text':
      return validateRepeatableText(value as string[], property as RepeatableTextProperty);
    case 'special-number':
      return validateSpecialNumber(
        value as string | number | boolean,
        property as SpecialNumberProperty
      );
    case 'font-family':
      return validateFontFamily(String(value), property as FontFamilyProperty);
    default:
      return failure(`Unknown value type: ${(property as ConfigProperty).valueType}`);
  }
}
