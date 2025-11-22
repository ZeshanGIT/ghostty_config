/**
 * Type definitions for Ghostty configuration schema
 */

/**
 * Property types supported by Ghostty config
 */
export type PropertyType = 'string' | 'number' | 'boolean' | 'enum' | 'repeatable';

/**
 * Validation rules for a config property
 */
export interface PropertyValidation {
  /** Minimum value (for numbers) */
  min?: number;
  /** Maximum value (for numbers) */
  max?: number;
  /** Regex pattern (for strings) */
  pattern?: string;
  /** Allowed values (for enums) */
  enum?: string[];
}

/**
 * A single configuration property
 */
export interface ConfigProperty {
  /** Property key (e.g., 'font-family') */
  key: string;
  /** Human-readable display name */
  displayName: string;
  /** Property type */
  type: PropertyType;
  /** Category this property belongs to */
  category: string;
  /** Section within the category */
  section: string;
  /** Description of the property */
  description: string;
  /** Default value (null if not specified) */
  defaultValue: string | null;
  /** Validation rules */
  validation?: PropertyValidation;
  /** Whether this property can appear multiple times */
  isRepeatable: boolean;
  /** Example usage */
  examples?: string[];
  /** Platform-specific property (e.g., 'macOS', 'Linux', 'GTK') */
  platform?: string;
}

/**
 * A section within a category (e.g., 'Font Settings' in 'Appearance')
 */
export interface ConfigSection {
  /** Section ID (e.g., 'font') */
  id: string;
  /** Human-readable display name */
  displayName: string;
  /** Properties in this section */
  properties: ConfigProperty[];
}

/**
 * A top-level category (e.g., 'Appearance', 'Input')
 */
export interface ConfigCategory {
  /** Category ID (e.g., 'appearance') */
  id: string;
  /** Human-readable display name */
  displayName: string;
  /** Icon name from lucide-react */
  icon: string;
  /** Sections within this category */
  sections: ConfigSection[];
}

/**
 * The complete Ghostty configuration schema
 */
export interface GhosttySchema {
  /** Schema version */
  version: string;
  /** All configuration categories */
  categories: ConfigCategory[];
}

/**
 * Quick lookup map for properties by key
 */
export type PropertyMap = Map<string, ConfigProperty>;
