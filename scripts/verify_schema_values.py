#!/usr/bin/env python3
"""
Verify Enriched Schema Against TypeScript Type Definitions

This script validates that the enriched JSON schema conforms to the
TypeScript interfaces defined in src/types/schema.ts
"""

import json
import sys
from typing import Dict, Any, List, Set

# Valid valueTypes based on TypeScript ConfigProperty union
VALID_VALUE_TYPES = {
    'text', 'number', 'boolean', 'enum', 'opacity', 'filepath',
    'color', 'keybinding', 'command', 'adjustment', 'padding',
    'font-style', 'repeatable-text', 'special-number', 'font-family'
}

# Required fields for all config items
REQUIRED_FIELDS = {'type', 'key', 'valueType', 'required', 'repeatable', 'defaultValue', 'label'}

# Optional fields for all config items
OPTIONAL_FIELDS = {'description', 'validation', 'options', 'platforms', 'deprecated'}

# Validation field mappings by valueType
VALIDATION_FIELDS = {
    'text': {'pattern', 'minLength', 'maxLength', 'format'},
    'number': {'min', 'max', 'integer', 'positive', 'multipleOf', 'unit'},
    'enum': {'customPattern', 'minItems', 'maxItems', 'caseSensitive', 'allowNegation', 'separator'},
    'opacity': {'min', 'max', 'snapToStep', 'logarithmic'},
    'filepath': {'mustExist', 'mustBeReadable', 'maxSizeKB', 'allowedPaths', 'extensions'},
    'color': {'allowTransparent', 'paletteOnly', 'allowSpecialValues'},
    'keybinding': {'forbiddenKeys', 'requireModifier', 'allowSequences', 'allowPrefixes'},
    'command': {'allowedCommands', 'pattern', 'allowPrefixes'},
    'adjustment': {'allowPercentage', 'allowInteger', 'minInteger', 'maxInteger', 'minPercentage', 'maxPercentage'},
    'padding': {'allowPair', 'min', 'max'},
    'font-style': {'allowDisable', 'allowDefault', 'styleNames'},
    'repeatable-text': {'pattern', 'minLength', 'maxLength', 'format', 'allowEmpty'},
    'special-number': {'min', 'max', 'integer', 'positive', 'multipleOf', 'unit'},
}

# Options field mappings by valueType
OPTIONS_FIELDS = {
    'text': {'placeholder', 'multiline'},
    'number': {'step', 'showUnit'},
    'boolean': set(),  # No options
    'enum': {'allowCustom', 'multiselect', 'values'},
    'opacity': {'min', 'max', 'step'},
    'filepath': {'fileType', 'dialogTitle'},
    'color': {'format', 'alpha'},
    'keybinding': {'showPrefixes', 'showSequences'},
    'command': {'showPrefixes'},
    'adjustment': {'defaultUnit'},
    'padding': {'allowPair', 'labels'},
    'font-style': {'allowDisable'},
    'repeatable-text': {'placeholder', 'format', 'allowEmpty'},
    'special-number': {'specialFormats', 'allowBoolean'},
    'font-family': {'allowSystemDefault'},
}


def validate_config_item(item: Dict[str, Any], tab_id: str, section_id: str) -> List[str]:
    """Validate a single config item."""
    errors = []
    location = f"{tab_id}/{section_id}/{item.get('key', 'UNKNOWN')}"

    # Check required fields
    missing_fields = REQUIRED_FIELDS - set(item.keys())
    if missing_fields:
        errors.append(f"{location}: Missing required fields: {missing_fields}")
        return errors  # Can't continue without required fields

    # Validate valueType
    value_type = item['valueType']
    if value_type not in VALID_VALUE_TYPES:
        errors.append(f"{location}: Invalid valueType '{value_type}'. Must be one of: {VALID_VALUE_TYPES}")

    # Validate type field
    if item['type'] != 'config':
        errors.append(f"{location}: type must be 'config', got '{item['type']}'")

    # Validate required and repeatable are booleans
    if not isinstance(item['required'], bool):
        errors.append(f"{location}: 'required' must be boolean")
    if not isinstance(item['repeatable'], bool):
        errors.append(f"{location}: 'repeatable' must be boolean")

    # Validate label is non-empty string
    if not isinstance(item['label'], str) or not item['label'].strip():
        errors.append(f"{location}: 'label' must be non-empty string")

    # Validate platforms (if present)
    if 'platforms' in item:
        platforms = item['platforms']
        if not isinstance(platforms, list):
            errors.append(f"{location}: 'platforms' must be array")
        else:
            valid_platforms = {'macos', 'linux', 'windows'}
            for platform in platforms:
                if platform not in valid_platforms:
                    errors.append(f"{location}: Invalid platform '{platform}'. Must be one of: {valid_platforms}")

    # Validate deprecated (if present)
    if 'deprecated' in item and not isinstance(item['deprecated'], bool):
        errors.append(f"{location}: 'deprecated' must be boolean")

    # Validate validation fields (if present)
    if 'validation' in item:
        validation = item['validation']
        if not isinstance(validation, dict):
            errors.append(f"{location}: 'validation' must be object")
        else:
            # Check for unknown validation fields
            allowed_fields = VALIDATION_FIELDS.get(value_type, set())
            unknown_fields = set(validation.keys()) - allowed_fields
            if unknown_fields:
                errors.append(f"{location}: Unknown validation fields for {value_type}: {unknown_fields}")

    # Validate options fields (if present)
    if 'options' in item:
        options = item['options']
        if not isinstance(options, dict):
            errors.append(f"{location}: 'options' must be object")
        else:
            # Check for unknown option fields
            allowed_fields = OPTIONS_FIELDS.get(value_type, set())
            unknown_fields = set(options.keys()) - allowed_fields
            if unknown_fields:
                errors.append(f"{location}: Unknown option fields for {value_type}: {unknown_fields}")

            # Validate enum values structure
            if value_type == 'enum' and 'values' in options:
                values = options['values']
                if not isinstance(values, list):
                    errors.append(f"{location}: enum 'values' must be array")
                else:
                    for i, value_obj in enumerate(values):
                        if not isinstance(value_obj, dict):
                            errors.append(f"{location}: enum values[{i}] must be object")
                        elif 'value' not in value_obj:
                            errors.append(f"{location}: enum values[{i}] missing 'value' field")

    return errors


def validate_schema(schema_path: str) -> bool:
    """Validate the entire schema file."""
    print(f"Loading schema from {schema_path}...")

    try:
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        return False

    # Validate root structure
    if 'version' not in schema or 'ghosttyVersion' not in schema or 'tabs' not in schema:
        print("❌ Schema missing required root fields: version, ghosttyVersion, tabs")
        return False

    all_errors = []
    config_item_count = 0
    comment_count = 0

    # Validate each tab -> section -> item
    for tab in schema['tabs']:
        if 'id' not in tab or 'label' not in tab or 'sections' not in tab:
            all_errors.append(f"Tab missing required fields: {tab}")
            continue

        tab_id = tab['id']

        for section in tab['sections']:
            if 'id' not in section or 'label' not in section or 'keys' not in section:
                all_errors.append(f"{tab_id}: Section missing required fields: {section}")
                continue

            section_id = section['id']

            for item in section['keys']:
                if 'type' not in item:
                    all_errors.append(f"{tab_id}/{section_id}: Item missing 'type' field")
                    continue

                if item['type'] == 'comment':
                    comment_count += 1
                    if 'content' not in item:
                        all_errors.append(f"{tab_id}/{section_id}: Comment missing 'content' field")

                elif item['type'] == 'config':
                    config_item_count += 1
                    errors = validate_config_item(item, tab_id, section_id)
                    all_errors.extend(errors)

                else:
                    all_errors.append(f"{tab_id}/{section_id}: Unknown item type '{item['type']}'")

    # Print results
    print(f"\n📊 Validation Summary:")
    print(f"  Config items validated: {config_item_count}")
    print(f"  Comment blocks: {comment_count}")
    print(f"  Total items: {config_item_count + comment_count}")

    if all_errors:
        print(f"\n❌ Found {len(all_errors)} error(s):")
        for error in all_errors:
            print(f"  - {error}")
        return False
    else:
        print(f"\n✅ Schema is valid! All {config_item_count} config items conform to TypeScript types.")
        return True


if __name__ == "__main__":
    schema_file = "ghosttyConfigSchema.json"

    if len(sys.argv) > 1:
        schema_file = sys.argv[1]

    success = validate_schema(schema_file)
    sys.exit(0 if success else 1)
