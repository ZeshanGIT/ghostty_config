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
 * Config keys (12 total):
 * - title: Window title
 * - class: GTK application class (default: com.mitchellh.ghostty)
 * - x11-instance-name: WM_CLASS instance name (default: ghostty)
 * - theme: Theme name or path (can be "light:name,dark:name")
 * - working-directory: Working directory (path or "home"/"inherit")
 * - term: Terminal type (default: xterm-ghostty)
 * - enquiry-response: Response to ENQ character
 * - bell-audio-path: Path to custom bell sound file
 * - custom-shader: Path to custom shader file
 * - gtk-custom-css: Path to custom GTK CSS file
 * - linux-cgroup: cgroup path for resource limits
 * - gtk-quick-terminal-namespace: GTK quick terminal namespace
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
 * Config keys (16 total):
 * - font-size: Font size in points (default: 13)
 * - font-thicken-strength: Thickening strength 0-255 (default: 255, macOS only)
 * - minimum-contrast: Contrast ratio 1-21 (default: 1)
 * - abnormal-command-exit-runtime: Runtime threshold in ms (default: 250)
 * - scrollback-limit: Scrollback buffer size in bytes (default: 10000000)
 * - window-height: Initial height in grid cells (default: 0 = auto)
 * - window-width: Initial width in grid cells (default: 0 = auto)
 * - window-position-x: X position in pixels (macOS only)
 * - window-position-y: Y position in pixels (macOS only)
 * - bell-audio-volume: Bell volume 0-100 (default: 100)
 * - click-repeat-interval: Click repeat interval in ms (default: 500)
 * - image-storage-limit: Image storage limit in bytes (default: 320000000)
 * - linux-cgroup-memory-limit: Memory limit in bytes
 * - linux-cgroup-processes-limit: Process limit
 * - quick-terminal-animation-duration: Animation duration in ms (default: 200)
 * - quit-after-last-window-closed-delay: Delay in ms (default: 0)
 * - resize-overlay-duration: Overlay duration in ms (default: 1000)
 * - undo-timeout: Undo timeout in seconds (default: 3)
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
 * Config keys (27 total):
 * - font-thicken: Enable font thickening (default: false, macOS only)
 * - link-url: Enable URL matching (default: true)
 * - maximize: Start maximized (default: false)
 * - fullscreen: Start in fullscreen (default: false)
 * - window-inherit-working-directory: Inherit working directory (default: true)
 * - window-inherit-font-size: Inherit font size (default: true)
 * - window-vsync: Sync with screen refresh (default: true)
 * - wait-after-command: Keep window open after exit (default: false)
 * - cursor-click-to-move: Alt+click to move cursor (default: true)
 * - mouse-hide-while-typing: Hide mouse when typing (default: false)
 * - selection-clear-on-typing: Clear selection when typing (default: true)
 * - selection-clear-on-copy: Clear selection after copy (default: false)
 * - window-padding-balance: Balance padding on all sides (default: false)
 * - background-image-repeat: Repeat background image (default: false)
 * - background-opacity-cells: Apply opacity to cells (default: false)
 * - clipboard-paste-bracketed-safe: Safe paste with bracketed mode (default: true)
 * - clipboard-paste-protection: Warn on multi-line paste (default: true)
 * - clipboard-trim-trailing-spaces: Trim trailing spaces (default: true)
 * - copy-on-select: Copy on selection (default: false)
 * - focus-follows-mouse: Focus follows mouse (default: false)
 * - gtk-opengl-debug: Enable OpenGL debugging (default: false, GTK only)
 * - gtk-single-instance: Single instance mode (default: true, GTK only)
 * - gtk-titlebar-hide-when-maximized: Hide titlebar when maximized (default: false, GTK only)
 * - gtk-wide-tabs: Wide tabs (default: true, GTK only)
 * - linux-cgroup-hard-fail: Hard fail on cgroup errors (default: false)
 * - macos-auto-secure-input: Auto enable secure input (default: false, macOS only)
 * - macos-hidden: Start hidden (default: false, macOS only)
 * - macos-non-native-fullscreen: Use non-native fullscreen (default: false, macOS only)
 * - macos-secure-input-indication: Show secure input indication (default: true, macOS only)
 * - macos-window-shadow: Window shadow (default: true, macOS only)
 * - quick-terminal-autohide: Auto-hide quick terminal (default: true)
 * - resize-overlay: Show resize overlay (default: true)
 * - vt-kam-allowed: Allow VT keyboard action mode (default: true)
 * - window-step-resize: Resize in cell steps (default: false)
 * - custom-shader-animation: Enable custom shader animation (default: true)
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
 * Single-select config keys (36 total):
 * - alpha-blending: native | linear | linear-corrected (default: native)
 * - grapheme-width-method: legacy | unicode (default: unicode)
 * - cursor-style: block | bar | underline | block_hollow (default: block)
 * - cursor-style-blink: (empty) | true | false (default: empty)
 * - background-image-position: top-left | top-center | top-right | center-left | center | center-right | bottom-left | bottom-center | bottom-right (default: center)
 * - background-image-fit: contain | cover | stretch | none (default: contain)
 * - window-padding-color: background | extend | extend-always (default: background)
 * - window-decoration: none | auto | client | server | true | false (default: auto)
 * - window-theme: auto | system | light | dark | ghostty (default: auto)
 * - window-colorspace: srgb | display-p3 (default: srgb, macOS only)
 * - window-subtitle: false | working-directory (default: false, GTK only)
 * - link-previews: true | false | osc8 (default: true)
 * - mouse-shift-capture: true | false | always | never (default: false)
 * - async-backend: auto | posix | kqueue | epoll | poll (default: auto)
 * - auto-update: off | check | download (default: off)
 * - auto-update-channel: stable | tip (default: stable)
 * - app-notifications: true | false | never (default: true)
 * - clipboard-read: allow | deny | ask (default: ask)
 * - clipboard-write: allow | deny | ask (default: allow)
 * - confirm-close-surface: true | false | always (default: true)
 * - desktop-notifications: true | false | unfocused (default: true)
 * - gtk-quick-terminal-layer: top | overlay | bottom (default: top, GTK only)
 * - gtk-tabs-location: top | bottom | left | right (default: top, GTK only)
 * - gtk-titlebar: true | false | auto (default: auto, GTK only)
 * - gtk-titlebar-style: normal | flat (default: normal, GTK only)
 * - gtk-toolbar-style: icons | both | both-horiz (default: icons, GTK only)
 * - initial-window: true | false | windowed | fullscreen | maximized (default: true)
 * - macos-dock-drop-behavior: new-window | new-tab (default: new-window, macOS only)
 * - macos-icon: official | custom | none (default: official, macOS only)
 * - macos-option-as-alt: true | false | left | right (default: false, macOS only)
 * - macos-shortcuts: true | false | custom (default: true, macOS only)
 * - macos-titlebar-proxy-icon: visible | hidden | always (default: visible, macOS only)
 * - macos-titlebar-style: native | tabs | hidden | transparent (default: native, macOS only)
 * - macos-window-buttons: true | false | hidden | traffic-lights (default: true, macOS only)
 * - osc-color-report-format: 8-bit | 16-bit (default: 16-bit)
 * - quick-terminal-keyboard-interactivity: always | focused | never (default: focused)
 * - quick-terminal-position: top | center | bottom (default: top)
 * - quick-terminal-screen: main | mouse | selection (default: main)
 * - quick-terminal-space-behavior: pin | switch | hide (default: switch)
 * - quit-after-last-window-closed: true | false | default (default: default)
 * - resize-overlay-position: top-left | top-center | top-right | center-left | center | center-right | bottom-left | bottom-center | bottom-right (default: center)
 * - right-click-action: select | paste | nothing (default: select)
 * - shell-integration: none | detect | zsh | bash | fish (default: detect)
 * - title-report: text | ansi (default: text)
 * - window-new-tab-position: current | end (default: end)
 * - window-save-state: never | default | always (default: default)
 * - window-show-tab-bar: true | false | never | always (default: true)
 *
 * Multi-select config keys (comma-separated with optional "no-" prefix):
 * - font-synthetic-style: bold, italic, bold-italic (default: bold,italic,bold-italic)
 * - freetype-load-flags: hinting, force-autohint, monochrome, autohint (default: hinting,no-force-autohint,no-monochrome,autohint)
 * - scroll-to-bottom: keystroke, output (default: keystroke,no-output)
 * - font-shaping-break: cursor (default: cursor)
 * - bell-features: visual, audio, focused (default: visual,audio,no-focused)
 * - shell-integration-features: cursor, sudo, title, prompt-mark, no-cursor, no-sudo, etc.
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
 * Config keys (5 total):
 * - cursor-opacity: Cursor opacity 0-1 (default: 1)
 * - background-opacity: Background opacity 0-1 (default: 1)
 * - background-image-opacity: Image opacity, can be >1 (default: 1)
 * - unfocused-split-opacity: Unfocused split opacity 0.15-1 (default: 0.7)
 * - faint-opacity: Faint text opacity 0-1 (default: 0.67)
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
 * Config keys (3 total):
 * - background-image: Path to PNG or JPEG file
 * - config-file: Path to config file (implied)
 * - macos-custom-icon: Path to custom icon file (macOS only)
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
 * Config keys (12 total):
 * - background: Background color (default: #282c34)
 * - foreground: Foreground color (default: #ffffff)
 * - selection-foreground: Selection fg (can be "cell-foreground" or "cell-background")
 * - selection-background: Selection bg (can be "cell-foreground" or "cell-background")
 * - cursor-color: Cursor color (can be "cell-foreground" or "cell-background")
 * - cursor-text: Cursor text color (can be "cell-foreground" or "cell-background")
 * - unfocused-split-fill: Unfocused split dim color
 * - split-divider-color: Split divider color
 * - palette: Palette entry (repeatable, format: N=#RRGGBB)
 * - bold-color: Bold text color (optional override)
 * - macos-icon-ghost-color: Ghost icon color (macOS only)
 * - macos-icon-screen-color: Screen icon color (macOS only)
 * - window-titlebar-background: Titlebar background color
 * - window-titlebar-foreground: Titlebar foreground color
 * - macos-icon-frame: Icon frame color (macOS only)
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
 * Config keys (1 total):
 * - keybind: Key binding (repeatable, format: trigger=action)
 *   Supports prefixes: global:, all:, unconsumed:, performable:
 *   Supports sequences: ctrl+a>n=new_window
 *   Special values: "clear" to clear all bindings
 */
export interface KeybindingProperty extends BaseConfigProperty {
  valueType: 'keybinding';
  defaultValue: string | null;
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
 * Config keys (3 total):
 * - command: Command to run (can have args, prefix with "direct:" or "shell:")
 * - initial-command: Initial command (same format as command)
 * - input: Input data (repeatable, format: "raw:text" or "path:/file")
 */
export interface CommandProperty extends BaseConfigProperty {
  valueType: 'command';
  defaultValue: string | null;
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
 * Config keys (13 total):
 * - adjust-cell-width: Cell width adjustment (integer or percentage)
 * - adjust-cell-height: Cell height adjustment (integer or percentage)
 * - adjust-font-baseline: Font baseline adjustment (integer or percentage)
 * - adjust-underline-position: Underline position adjustment (integer or percentage)
 * - adjust-underline-thickness: Underline thickness adjustment (integer or percentage)
 * - adjust-strikethrough-position: Strikethrough position adjustment (integer or percentage)
 * - adjust-strikethrough-thickness: Strikethrough thickness adjustment (integer or percentage)
 * - adjust-overline-position: Overline position adjustment (integer or percentage)
 * - adjust-overline-thickness: Overline thickness adjustment (integer or percentage)
 * - adjust-cursor-thickness: Cursor thickness adjustment (integer or percentage)
 * - adjust-cursor-height: Cursor height adjustment (integer or percentage)
 * - adjust-box-thickness: Box drawing thickness adjustment (integer or percentage)
 * - adjust-icon-height: Icon height adjustment (integer or percentage)
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
 * Config keys (2 total):
 * - window-padding-x: Horizontal padding (single or "left,right")
 * - window-padding-y: Vertical padding (single or "top,bottom")
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
 * Config keys (4 total):
 * - font-style: Font style (default: "default", can be "false" to disable)
 * - font-style-bold: Bold font style
 * - font-style-italic: Italic font style
 * - font-style-bold-italic: Bold italic font style
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
 * Config keys (13 total):
 * - font-family: Font family name (repeatable for fallbacks, empty string to reset)
 * - font-family-bold: Bold font family
 * - font-family-italic: Italic font family
 * - font-family-bold-italic: Bold italic font family
 * - font-feature: Font feature settings (repeatable, e.g., "+calt", "-liga")
 * - font-variation: Font variation axis (repeatable, format: "axis=value")
 * - font-variation-bold: Bold font variation
 * - font-variation-italic: Italic font variation
 * - font-variation-bold-italic: Bold italic font variation
 * - font-codepoint-map: Codepoint to font mapping (repeatable, format: "U+XXXX=FontName")
 * - env: Environment variable (repeatable, format: "KEY=VALUE", empty value removes)
 * - command-palette-entry: Custom command palette entry (repeatable)
 * - config-default-files: Default config files (repeatable)
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
 * Config keys (2 total):
 * - mouse-scroll-multiplier: Scroll multiplier (can be "3" or "precision:1,discrete:3")
 * - background-blur: Blur intensity (false | true | integer, default: false)
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
 * Config keys (1 total):
 * - window-title-font-family: Font family for window/tab titles (GTK only)
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
