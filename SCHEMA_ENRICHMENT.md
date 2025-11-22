# Schema Enrichment Summary

This document describes the enrichment process applied to `ghosttyConfigSchema.json` to make it complete and ready for UI rendering.

## Overview

The schema has been enriched with comprehensive metadata for all 180 configuration properties, including:

- **Labels**: Human-readable display names for every property
- **Validation**: Type-specific validation rules (60.6% of properties)
- **Options**: UI rendering options (65% of properties)
- **Platform Restrictions**: Platform-specific configurations (50.6% of properties)

## Enrichment Process

### 1. Automated Enrichment Script

Created `enrich_schema.py` which:

1. Generates human-readable labels from config keys
2. Detects platform restrictions from comment blocks
3. Adds type-specific validation rules
4. Adds UI rendering options for each property type

### 2. Added Fields

#### Labels (100% coverage)

Every configuration property now has a human-readable label:

```json
{
  "key": "font-size",
  "label": "Font Size",
  ...
}
```

Special handling for:

- Font family variants: "Font Family (Bold)", "Font Family (Italic)", etc.
- Adjustment properties: "Adjust Cell Width", "Adjust Underline Position", etc.
- Platform-specific properties with clear names

#### Validation Rules (60.6% coverage)

Type-specific validation added where applicable:

**Number Properties:**

```json
{
  "key": "font-size",
  "validation": {
    "min": 1,
    "max": 500,
    "positive": true,
    "unit": "pt"
  }
}
```

**Opacity Properties:**

```json
{
  "key": "cursor-opacity",
  "validation": {
    "min": 0,
    "max": 1
  }
}
```

**Enum Properties:**

```json
{
  "key": "font-synthetic-style",
  "validation": {
    "caseSensitive": false,
    "allowNegation": true,
    "separator": ","
  }
}
```

**Color Properties:**

```json
{
  "key": "selection-foreground",
  "validation": {
    "allowSpecialValues": ["cell-foreground", "cell-background"]
  }
}
```

**Repeatable Text Properties:**

```json
{
  "key": "font-variation",
  "validation": {
    "format": "key-value",
    "allowEmpty": true
  }
}
```

#### UI Options (65% coverage)

Rendering hints for UI components:

**Number Inputs:**

```json
{
  "key": "font-size",
  "options": {
    "step": 0.5,
    "showUnit": true
  }
}
```

**Opacity Sliders:**

```json
{
  "key": "background-opacity",
  "options": {
    "min": 0,
    "max": 1,
    "step": 0.01
  }
}
```

**Enum Select/Multi-Select:**

```json
{
  "key": "cursor-style",
  "options": {
    "allowCustom": false,
    "multiselect": false,
    "values": [
      {
        "value": "block",
        "description": "Block cursor"
      },
      {
        "value": "bar",
        "description": "Bar cursor"
      },
      {
        "value": "underline",
        "description": "Underline cursor"
      },
      {
        "value": "block_hollow",
        "description": "Hollow block cursor"
      }
    ]
  }
}
```

**Filepath Inputs:**

```json
{
  "key": "background-image",
  "options": {
    "fileType": "image",
    "dialogTitle": "Select Background Image"
  },
  "validation": {
    "extensions": [".png", ".jpg", ".jpeg"]
  }
}
```

**Color Pickers:**

```json
{
  "key": "background",
  "options": {
    "format": "hex",
    "alpha": false
  }
}
```

**Padding Inputs:**

```json
{
  "key": "window-padding-x",
  "options": {
    "allowPair": true,
    "labels": ["Left", "Right"]
  },
  "validation": {
    "allowPair": true,
    "min": 0
  }
}
```

**Repeatable Text Inputs:**

```json
{
  "key": "font-feature",
  "options": {
    "placeholder": "e.g., -calt, +liga",
    "format": "plain"
  },
  "validation": {
    "allowEmpty": true
  }
}
```

**Keybinding Recorder:**

```json
{
  "key": "keybind",
  "options": {
    "showPrefixes": true,
    "showSequences": true
  },
  "validation": {
    "requireModifier": false,
    "allowSequences": true,
    "allowPrefixes": ["global:", "all:", "unconsumed:", "performable:"]
  }
}
```

#### Platform Restrictions (50.6% coverage)

Platform-specific properties are marked:

```json
{
  "key": "font-thicken",
  "platforms": ["macos"]
}
```

```json
{
  "key": "freetype-load-flags",
  "platforms": ["linux"]
}
```

Platform detection rules:

- "only supported on macOS" → `["macos"]`
- "only supported on Linux" / "only affects GTK" → `["linux"]`
- Platform mentions without "only" → included in array but not exclusive

## Validation

The enriched schema has been validated against TypeScript type definitions:

```bash
python3 verify_schema_values.py ghosttyConfigSchema.json
```

Results:

- ✅ All 180 config items conform to TypeScript types
- ✅ All required fields present
- ✅ All validation fields match allowed fields for each valueType
- ✅ All option fields match allowed fields for each valueType
- ✅ Enum values have correct structure
- ✅ Platform values are valid ("macos", "linux", "windows")

## Type-Specific Validation & Options Summary

| ValueType         | Validation Fields                       | Option Fields                    | Example Properties                       |
| ----------------- | --------------------------------------- | -------------------------------- | ---------------------------------------- |
| `text`            | pattern, minLength, maxLength, format   | placeholder, multiline           | title, theme, class                      |
| `number`          | min, max, integer, positive, unit       | step, showUnit                   | font-size, scrollback-limit              |
| `boolean`         | (none)                                  | (none)                           | font-thicken, link-url                   |
| `enum`            | caseSensitive, allowNegation, separator | allowCustom, multiselect, values | cursor-style, window-theme               |
| `opacity`         | min, max                                | min, max, step                   | cursor-opacity, background-opacity       |
| `filepath`        | extensions, mustExist                   | fileType, dialogTitle            | background-image, working-directory      |
| `color`           | allowSpecialValues                      | format, alpha                    | background, foreground, cursor-color     |
| `keybinding`      | allowSequences, allowPrefixes           | showPrefixes, showSequences      | keybind                                  |
| `command`         | allowPrefixes                           | showPrefixes                     | command, initial-command                 |
| `adjustment`      | allowPercentage, allowInteger, min/max  | defaultUnit                      | adjust-cell-width, adjust-font-baseline  |
| `padding`         | allowPair, min, max                     | allowPair, labels                | window-padding-x, window-padding-y       |
| `font-style`      | allowDisable, allowDefault              | allowDisable                     | font-style, font-style-bold              |
| `repeatable-text` | format, allowEmpty                      | placeholder, format, allowEmpty  | font-family, font-feature, env           |
| `special-number`  | min, max, integer, unit                 | specialFormats, allowBoolean     | mouse-scroll-multiplier, background-blur |
| `font-family`     | (text validation)                       | allowSystemDefault               | window-title-font-family                 |

## Example Enum Properties with Values

### Alpha Blending

```json
{
  "key": "alpha-blending",
  "options": {
    "values": [
      {
        "value": "native",
        "description": "Use native color space (Display P3 on macOS, sRGB on Linux)"
      },
      {
        "value": "linear",
        "description": "Linear space blending (eliminates darkening artifacts)"
      },
      {
        "value": "linear-corrected",
        "description": "Linear with correction for text"
      }
    ]
  }
}
```

### Window Decoration

```json
{
  "key": "window-decoration",
  "options": {
    "values": [
      {
        "value": "auto",
        "description": "Automatic (native look)"
      },
      {
        "value": "none",
        "description": "No decorations"
      },
      {
        "value": "client",
        "description": "Client-side decorations"
      },
      {
        "value": "server",
        "description": "Server-side decorations"
      }
    ]
  }
}
```

### Background Image Fit

```json
{
  "key": "background-image-fit",
  "options": {
    "values": [
      {
        "value": "contain",
        "description": "Scale to fit (preserves aspect ratio)"
      },
      {
        "value": "cover",
        "description": "Scale to fill (may clip)"
      },
      {
        "value": "stretch",
        "description": "Stretch to fill (ignores aspect ratio)"
      },
      {
        "value": "none",
        "description": "No scaling"
      }
    ]
  }
}
```

## Files Created

1. **`enrich_schema.py`** - Enrichment script that adds metadata to schema
2. **`verify_schema_values.py`** - Validation script that checks schema against TypeScript types
3. **`ghosttyConfigSchema.backup.json`** - Backup of original schema before enrichment
4. **`ghosttyConfigSchema.json`** - Enriched schema (ready for UI)

## Usage

### Re-run Enrichment

If the schema needs to be regenerated or updated:

```bash
python3 enrich_schema.py ghosttyConfigSchema.backup.json ghosttyConfigSchema.json
```

### Validate Schema

To verify the schema conforms to TypeScript types:

```bash
python3 verify_schema_values.py ghosttyConfigSchema.json
```

## Next Steps

The enriched schema is now ready for:

1. **UI Component Mapping**: Each property type can be mapped to its corresponding shadcn/ui component
2. **Form Validation**: Validation rules can be used for client-side validation
3. **Platform Filtering**: Platform restrictions can be used to hide/show properties based on OS
4. **Autocomplete**: Enum values and options can be used for autocomplete and suggestions
5. **Help Text**: Labels and descriptions provide user-friendly help text

## Statistics

- **Total Properties**: 180
- **Properties with Labels**: 180 (100%)
- **Properties with Validation**: 109 (60.6%)
- **Properties with Options**: 117 (65%)
- **Properties with Platform Restrictions**: 91 (50.6%)
- **Comment Blocks**: 166
- **Total Schema Items**: 346

## Conclusion

The schema enrichment process successfully added comprehensive metadata to all 180 Ghostty configuration properties. The schema is now complete, validated, and ready for UI implementation with full type safety and user-friendly controls.
