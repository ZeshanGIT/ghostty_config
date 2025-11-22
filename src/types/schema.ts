/**
 * Ghostty Configuration Schema Type Definitions
 *
 * This file defines the TypeScript schema for the comprehensive Ghostty configuration JSON.
 *
 * Purpose:
 * --------
 * Provides a complete type system for all Ghostty configuration properties with:
 * 1. ALL 180 configuration properties (complete coverage)
 * 2. Complete documentation/comments for each property (displayed as markdown in UI)
 * 3. Rich metadata for UI rendering (control types, validation rules, options)
 * 4. Hierarchical organization (Tabs → Sections → Items)
 * 5. Flexible validation (allows custom values while providing suggestions)
 *
 * UI Component Mapping:
 * --------------------
 * Each property type is mapped to shadcn/ui components for rendering:
 * - TextProperty → Input (text)
 * - NumberProperty → Input (number) or Slider
 * - BooleanProperty → Switch
 * - EnumProperty → Select (single) or Multi-Select (multiple)
 * - ColorProperty → Custom Color Picker (Input + Popover)
 * - FilePathProperty → Input with file dialog Button
 * - KeybindingProperty → Custom Keybind Recorder
 * - CommandProperty → Input with autocomplete
 * - AdjustmentProperty → Input with percentage/pixel toggle
 * - PaddingProperty → Input (single) or two Inputs (pair)
 * - FontStyleProperty → Select with "Disable" option
 * - OpacityProperty → Slider (0-1 or custom range)
 * - RepeatableTextProperty → List of Inputs with Add/Remove buttons
 * - SpecialNumberProperty → Input with custom format support
 */

// ============================================
// Root Schema
// ============================================

export interface GhosttyConfigSchema {
  version: string;
  ghosttyVersion: string;
  tabs: Tab[];
}

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  sections: Section[];
}

export interface Section {
  id: string;
  label: string;
  description?: string;
  items: Item[];
}

// ============================================
// Item Types (Discriminated Union)
// ============================================

export type Item = CommentBlock | ConfigProperty;

export interface CommentBlock {
  type: 'comment';
  content: string; // Markdown content
}

// ============================================
// Common Base for All Config Properties
// ============================================

interface BaseConfigProperty {
  type: 'config';
  key: string;
  label: string;
  description: string;
  required: boolean;
  repeatable: boolean;
  deprecated?: boolean;
  platforms?: ('macos' | 'linux' | 'windows')[];
}

// ============================================
// Validation Interfaces (Type-Specific)
// ============================================

export interface TextValidation {
  pattern?: string; // Regex pattern
  minLength?: number;
  maxLength?: number;
  format?: 'email' | 'url' | 'path' | 'hostname' | 'hex-color' | 'key-value';
}

export interface NumberValidation {
  min?: number;
  max?: number;
  integer?: boolean; // Must be whole number
  positive?: boolean; // Must be > 0
  multipleOf?: number; // Must be divisible by this
  unit?: string; // Display unit (e.g., "px", "ms", "%", "bytes")
}

export interface EnumValidation {
  customPattern?: string; // Regex for custom values when allowCustom is true
  minItems?: number; // For multiselect
  maxItems?: number; // For multiselect
  caseSensitive?: boolean; // Default: false
}

export interface SliderValidation {
  snapToStep?: boolean; // Must be exact multiple of step
  logarithmic?: boolean; // Use logarithmic scale
}

export interface FilePathValidation {
  mustExist?: boolean;
  mustBeReadable?: boolean;
  maxSizeKB?: number;
  allowedPaths?: string[]; // Restrict to certain directories
  extensions?: string[]; // Allowed file extensions (e.g., ['.png', '.jpg'])
}

export interface ColorValidation {
  allowTransparent?: boolean;
  paletteOnly?: string[]; // Restrict to specific color values
  allowSpecialValues?: string[]; // e.g., ['cell-foreground', 'cell-background']
}

export interface KeybindingValidation {
  forbiddenKeys?: string[]; // Keys that cannot be bound
  requireModifier?: boolean; // Must include Ctrl/Cmd/Alt
  allowSequences?: boolean; // Allow key sequences (e.g., ctrl+a>n)
  allowPrefixes?: string[]; // e.g., ['global:', 'all:', 'unconsumed:']
}

export interface CommandValidation {
  allowedCommands?: string[]; // Whitelist of commands
  pattern?: string; // Regex for command format
  allowPrefixes?: string[]; // e.g., ['direct:', 'shell:']
}

export interface AdjustmentValidation {
  allowPercentage?: boolean; // Allow percentage values (e.g., "20%")
  allowInteger?: boolean; // Allow integer values (e.g., 1, -1)
  minInteger?: number; // Minimum integer value
  maxInteger?: number; // Maximum integer value
  minPercentage?: number; // Minimum percentage value
  maxPercentage?: number; // Maximum percentage value
}

export interface PaddingValidation {
  allowPair?: boolean; // Allow comma-separated pairs (e.g., "2,4")
  min?: number; // Minimum value
  max?: number; // Maximum value
}

export interface FontStyleValidation {
  allowDisable?: boolean; // Allow literal "false" to disable
  allowDefault?: boolean; // Allow "default" value
  styleNames?: string[]; // Allowed style names
}

export interface MultiValueValidation {
  allowedValues?: string[]; // List of valid values
  allowNegation?: boolean; // Allow "no-" prefix (e.g., "no-bold")
  separator?: string; // Default: ","
  caseSensitive?: boolean; // Default: false
}

// ============================================
// Config Property Types (Discriminated Union)
// ============================================

/**
 * TextProperty - Simple string values
 *
 * shadcn component: <Input type="text" />
 *
 */
export interface TextProperty extends BaseConfigProperty {
  valueType: 'text';
  defaultValue: string | null;
  validation?: TextValidation;
  options?: {
    placeholder?: string;
    multiline?: boolean;
  };
}

/**
 * NumberProperty - Numeric values with constraints
 *
 * shadcn component: <Input type="number" /> or <Slider />
 *
 */
export interface NumberProperty extends BaseConfigProperty {
  valueType: 'number';
  defaultValue: number | null;
  validation?: NumberValidation;
  options?: {
    step?: number;
    showUnit?: boolean;
  };
}

/**
 * BooleanProperty - True/false toggles
 *
 * shadcn component: <Switch />
 *
 */
export interface BooleanProperty extends BaseConfigProperty {
  valueType: 'boolean';
  defaultValue: boolean;
  validation?: never;
  options?: never;
}

/**
 * EnumProperty - Predefined options with optional custom values
 *
 * shadcn component: <Select /> (single) or <MultiSelect /> (multiple)
 *
 */
export interface EnumProperty extends BaseConfigProperty {
  valueType: 'enum';
  defaultValue: string | string[] | null;
  validation?: EnumValidation;
  options: {
    allowCustom: boolean;
    multiselect: boolean;
    values: Array<{
      value: string;
      description?: string;
    }>;
  };
}

/**
 * OpacityProperty - Numeric opacity values with slider (0-1 or custom range)
 *
 * shadcn component: <Slider />
 *
 */
export interface OpacityProperty extends BaseConfigProperty {
  valueType: 'opacity';
  defaultValue: number;
  validation?: SliderValidation;
  options: {
    min: number;
    max: number;
    step: number;
  };
}

/**
 * FilePathProperty - File and directory paths
 *
 * shadcn component: <Input /> with <Button> (file dialog)
 *
 */
export interface FilePathProperty extends BaseConfigProperty {
  valueType: 'filepath';
  defaultValue: string | null;
  validation?: FilePathValidation;
  options: {
    fileType: 'image' | 'config' | 'font' | 'directory' | 'icon' | 'shader' | 'audio' | 'any';
    dialogTitle?: string;
  };
}

/**
 * ColorProperty - Color values (hex, rgb, named X11 colors, or special values)
 *
 * shadcn component: <Input /> with <Popover> (color picker)
 *
 */
export interface ColorProperty extends BaseConfigProperty {
  valueType: 'color';
  defaultValue: string | null;
  validation?: ColorValidation;
  options?: {
    format: 'hex' | 'rgb' | 'rgba' | 'named';
    alpha?: boolean;
  };
}

/**
 * KeybindingProperty - Keyboard shortcuts and bindings
 *
 * shadcn component: Custom <KeybindRecorder /> component
 *
 */
/**
 * Parsed key combination
 */
export interface KeyCombo {
  modifiers: string[]; // e.g., ["super", "shift"]
  key: string; // e.g., "d"
}

/**
 * Structured keybinding entry
 */
export interface KeybindingEntry {
  keyCombo: KeyCombo;
  action: string;
}

export interface KeybindingProperty extends BaseConfigProperty {
  valueType: 'keybinding';
  defaultValue: KeybindingEntry | null;
  validation?: KeybindingValidation;
  options?: {
    showPrefixes?: boolean;
    showSequences?: boolean;
  };
}

/**
 * CommandProperty - Shell commands with optional prefixes
 *
 * shadcn component: <Input /> with autocomplete
 *
 */
/**
 * Structured command entry for command-palette-entry
 */
export interface CommandEntry {
  title: string;
  description?: string;
  action: string;
}

export interface CommandProperty extends BaseConfigProperty {
  valueType: 'command';
  defaultValue: CommandEntry | null;
  validation?: CommandValidation;
  options?: {
    showPrefixes?: boolean;
  };
}

/**
 * AdjustmentProperty - Integer or percentage adjustments
 *
 * shadcn component: <Input /> with percentage/pixel toggle <Button>
 *
 */
export interface AdjustmentProperty extends BaseConfigProperty {
  valueType: 'adjustment';
  defaultValue: string | null; // Can be "1", "-1", "20%", "-15%"
  validation?: AdjustmentValidation;
  options?: {
    defaultUnit?: 'px' | 'percent';
  };
}

/**
 * PaddingProperty - Single value or comma-separated pair
 *
 * shadcn component: <Input /> (single) or two <Input />s (pair)
 *
 */
export interface PaddingProperty extends BaseConfigProperty {
  valueType: 'padding';
  defaultValue: string | null; // "2" or "2,4"
  validation?: PaddingValidation;
  options?: {
    allowPair?: boolean;
    labels?: [string, string]; // e.g., ["Left", "Right"]
  };
}

/**
 * FontStyleProperty - Font style name or literal "false" to disable
 *
 * shadcn component: <Select /> with "Disable" option
 *
 */
export interface FontStyleProperty extends BaseConfigProperty {
  valueType: 'font-style';
  defaultValue: string | null; // Style name or "default" or "false"
  validation?: FontStyleValidation;
  options?: {
    allowDisable?: boolean;
  };
}

/**
 * RepeatableTextProperty - Text values that can be repeated (font families, features, etc.)
 *
 * shadcn component: <Input /> with "Add" <Button> for multiple entries
 *
 */
export interface RepeatableTextProperty extends BaseConfigProperty {
  valueType: 'repeatable-text';
  defaultValue: string[] | null;
  validation?: TextValidation;
  options?: {
    placeholder?: string;
    format?: 'plain' | 'key-value' | 'assignment'; // For parsing display
    allowEmpty?: boolean; // Allow empty string to reset/remove
  };
}

/**
 * SpecialNumberProperty - Numbers with special format (e.g., mouse-scroll-multiplier)
 *
 * shadcn component: <Input /> or custom component
 *
 */
export interface SpecialNumberProperty extends BaseConfigProperty {
  valueType: 'special-number';
  defaultValue: string | number | boolean;
  validation?: NumberValidation;
  options?: {
    specialFormats?: string[]; // e.g., ["precision:N,discrete:N"]
    allowBoolean?: boolean;
  };
}

/**
 * FontFamilyProperty - Special font family property with reset capability
 *
 * shadcn component: <Input /> with font picker and reset button
 *
 */
export interface FontFamilyProperty extends BaseConfigProperty {
  valueType: 'font-family';
  defaultValue: string | null;
  validation?: TextValidation;
  options?: {
    allowSystemDefault?: boolean;
  };
}

// ============================================
// Union of All Config Property Types
// ============================================

export type ConfigProperty =
  | TextProperty
  | NumberProperty
  | BooleanProperty
  | EnumProperty
  | OpacityProperty
  | FilePathProperty
  | ColorProperty
  | KeybindingProperty
  | CommandProperty
  | AdjustmentProperty
  | PaddingProperty
  | FontStyleProperty
  | RepeatableTextProperty
  | SpecialNumberProperty
  | FontFamilyProperty;

// ============================================
// Type Guards (for runtime type checking)
// ============================================

export function isCommentBlock(item: Item): item is CommentBlock {
  return item.type === 'comment';
}

export function isConfigProperty(item: Item): item is ConfigProperty {
  return item.type === 'config';
}

export function isTextProperty(prop: ConfigProperty): prop is TextProperty {
  return prop.valueType === 'text';
}

export function isNumberProperty(prop: ConfigProperty): prop is NumberProperty {
  return prop.valueType === 'number';
}

export function isBooleanProperty(prop: ConfigProperty): prop is BooleanProperty {
  return prop.valueType === 'boolean';
}

export function isEnumProperty(prop: ConfigProperty): prop is EnumProperty {
  return prop.valueType === 'enum';
}

export function isOpacityProperty(prop: ConfigProperty): prop is OpacityProperty {
  return prop.valueType === 'opacity';
}

export function isFilePathProperty(prop: ConfigProperty): prop is FilePathProperty {
  return prop.valueType === 'filepath';
}

export function isColorProperty(prop: ConfigProperty): prop is ColorProperty {
  return prop.valueType === 'color';
}

export function isKeybindingProperty(prop: ConfigProperty): prop is KeybindingProperty {
  return prop.valueType === 'keybinding';
}

export function isCommandProperty(prop: ConfigProperty): prop is CommandProperty {
  return prop.valueType === 'command';
}

export function isAdjustmentProperty(prop: ConfigProperty): prop is AdjustmentProperty {
  return prop.valueType === 'adjustment';
}

export function isPaddingProperty(prop: ConfigProperty): prop is PaddingProperty {
  return prop.valueType === 'padding';
}

export function isFontStyleProperty(prop: ConfigProperty): prop is FontStyleProperty {
  return prop.valueType === 'font-style';
}

export function isRepeatableTextProperty(prop: ConfigProperty): prop is RepeatableTextProperty {
  return prop.valueType === 'repeatable-text';
}

export function isSpecialNumberProperty(prop: ConfigProperty): prop is SpecialNumberProperty {
  return prop.valueType === 'special-number';
}

export function isFontFamilyProperty(prop: ConfigProperty): prop is FontFamilyProperty {
  return prop.valueType === 'font-family';
}
