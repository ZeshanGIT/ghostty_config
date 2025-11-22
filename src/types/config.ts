/**
 * Type definitions for config file parsing and saving
 */

/**
 * Type of a config file line
 */
export type ConfigLineType = 'comment' | 'blank' | 'property' | 'unknown';

/**
 * A single line in a config file
 */
export interface ConfigLine {
  /** Type of line */
  type: ConfigLineType;
  /** Original line text (preserved for file saving) */
  content: string;
  /** Line number (1-indexed) */
  lineNumber: number;
  /** Property key (only for property lines) */
  key?: string;
  /** Property value (only for property lines) */
  value?: string;
  /** Full original line for format preservation */
  raw?: string;
}

/**
 * Invalid line in config file
 */
export interface InvalidLine {
  /** Line number (1-indexed) */
  lineNumber: number;
  /** Original line content */
  content: string;
  /** Error message */
  error: string;
}

/**
 * Warning about config parsing
 */
export interface ConfigWarning {
  /** Warning type */
  type: 'unknown-property' | 'validation-error' | 'deprecated' | 'parse-error';
  /** Line number where warning occurred */
  lineNumber?: number;
  /** Property key (if applicable) */
  key?: string;
  /** Warning message */
  message: string;
}

/**
 * Result of parsing a config file
 */
export interface ParseResult {
  /** Successfully parsed lines */
  lines: ConfigLine[];
  /** Successfully parsed properties */
  valid: Map<string, string | string[]>;
  /** Invalid lines that couldn't be parsed */
  invalid: InvalidLine[];
  /** Warnings about the config */
  warnings: ConfigWarning[];
  /** Unknown properties (not in schema) */
  unknownProperties: Map<string, string>;
}

/**
 * Parsed config file with metadata
 */
export interface ParsedConfigFile {
  /** All lines from the file */
  lines: ConfigLine[];
  /** Map of property key to line number(s) */
  propertyMap: Map<string, number[]>;
  /** Parse result metadata */
  parseResult: ParseResult;
}

/**
 * User's config state in the application
 */
export interface ConfigState {
  /** Current config values (property key -> value) */
  config: Map<string, string | string[]>;
  /** Properties that have been modified by user */
  modifiedProperties: Set<string>;
  /** Parsed config file (for saving back) */
  parsedFile: ParsedConfigFile | null;
  /** Path to the config file */
  filePath: string | null;
  /** Timestamp when file was loaded */
  loadedTimestamp: number | null;
}
