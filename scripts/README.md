# Scripts Directory

This directory contains utility scripts for generating, enriching, and validating the Ghostty configuration schema.

## Schema Generation & Enrichment

### `generate_schema.py`

Generates the base TypeScript schema from Ghostty documentation.

```bash
python3 generate_schema.py
```

**Outputs**: `ghosttyConfigSchema.json` (base schema without enrichment)

### `enrich_schema.py`

Enriches the schema with labels, validation, options, and platform restrictions.

```bash
python3 enrich_schema.py ghosttyConfigSchema.json ghosttyConfigSchema.enriched.json
```

**Features**:

- Generates human-readable labels from config keys
- Detects platform restrictions from comment blocks
- Adds type-specific validation rules
- Adds UI rendering options for each property type

### `parse_command_entries.py`

Parses command palette entries from Ghostty documentation.

```bash
python3 parse_command_entries.py
```

## Validation Scripts

### `verify_schema_values.py`

Validates that the enriched schema conforms to TypeScript type definitions.

```bash
python3 verify_schema_values.py ghosttyConfigSchema.json
```

**Checks**:

- All required fields present
- Valid valueType values
- Validation fields match allowed fields for each valueType
- Option fields match allowed fields for each valueType
- Enum values have correct structure
- Platform values are valid

### `verify_all_labels.py`

Verifies that ALL config properties have labels.

```bash
python3 verify_all_labels.py ghosttyConfigSchema.json
```

**Checks**:

- Every config item has a 'label' field
- Labels are non-empty strings
- Labels are properly formatted

### `verify_complete_enrichment.py`

Comprehensive verification of all enrichment fields.

```bash
python3 verify_complete_enrichment.py ghosttyConfigSchema.json
```

**Reports**:

- Required fields coverage
- Enrichment coverage (validation, options, platforms)
- Breakdown by value type
- Detailed error messages

### `verify_schema.py`

Basic schema structure validation.

```bash
python3 verify_schema.py
```

### `verify_schema_coverage.py`

Verifies schema coverage of Ghostty configuration properties.

```bash
python3 verify_schema_coverage.py
```

### `verify_categorization.py`

Verifies that config properties are correctly categorized.

```bash
python3 verify_categorization.py
```

### `verify_key_ordering.py`

Verifies the ordering of keys in the schema.

```bash
python3 verify_key_ordering.py
```

## TypeScript Scripts

### `generateSchema.ts`

TypeScript implementation of schema generation.

```bash
pnpm tsx scripts/generateSchema.ts
```

### `testParser.ts`

Tests for the config file parser.

```bash
pnpm tsx scripts/testParser.ts
```

## Archive Directory

The `archive/` subdirectory contains:

- **`ghostty_default_docs.properties`**: Source documentation from Ghostty
- **`categorizedGhosttyConfigKeys.json`**: Old categorization (superseded by schema)
- **`ghosttyConfigSchema.backup.json`**: Backup before enrichment
- **`available_themes.txt`**: List of available Ghostty themes
- **`test-config.properties`**: Test configuration file

## Typical Workflow

1. **Generate base schema**:

   ```bash
   python3 scripts/generate_schema.py
   ```

2. **Enrich schema**:

   ```bash
   python3 scripts/enrich_schema.py ghosttyConfigSchema.json ghosttyConfigSchema.json
   ```

3. **Validate schema**:
   ```bash
   python3 scripts/verify_schema_values.py ghosttyConfigSchema.json
   python3 scripts/verify_all_labels.py ghosttyConfigSchema.json
   python3 scripts/verify_complete_enrichment.py ghosttyConfigSchema.json
   ```

## Dependencies

All Python scripts require Python 3.7+. No external dependencies needed.

TypeScript scripts require:

- Node.js 18+
- pnpm (package manager)
- Dependencies from `package.json`
