#!/usr/bin/env python3
"""
Generate final GhosttyConfigSchema JSON from categorization and properties files
"""

import json
from pathlib import Path
from typing import Dict, Optional, List


def parse_properties_file(properties_file: Path) -> tuple[Dict[str, List[str]], Dict[str, Optional[str]]]:
    """
    Parse properties file to extract:
    1. Default values for each key (supports multiple values for repeatable keys)
    2. Comments associated with each key

    Returns: (default_values, key_comments)
    """
    default_values = {}
    key_comments = {}

    with open(properties_file, 'r') as f:
        lines = f.readlines()

    current_comment_lines = []

    for line in lines:
        stripped = line.strip()

        # If it's a comment line, accumulate it
        if stripped.startswith('#'):
            comment_text = stripped[1:].strip()  # Remove # and strip
            if comment_text:  # Only add non-empty comments
                current_comment_lines.append(comment_text)

        # If it's a blank line, keep accumulating comments (don't reset)
        elif not stripped:
            continue

        # If it's a key=value line
        elif '=' in stripped:
            key = stripped.split('=', 1)[0].strip()
            value = stripped.split('=', 1)[1].strip() if len(stripped.split('=', 1)) > 1 else ''

            if key:
                # Store default value (support multiple values)
                if key not in default_values:
                    default_values[key] = []
                default_values[key].append(value)

                # Store comment only for the first occurrence
                if key not in key_comments:
                    if current_comment_lines:
                        key_comments[key] = '\n'.join(current_comment_lines)
                    else:
                        key_comments[key] = None

                # Reset comment accumulator
                current_comment_lines = []
        else:
            # Unknown line type, reset comment accumulator
            current_comment_lines = []

    return default_values, key_comments


def infer_platforms(key: str) -> Optional[List[str]]:
    """Infer platform restrictions from key name"""
    if key.startswith('macos-'):
        return ['macos']
    elif key.startswith('gtk-'):
        return ['linux']
    elif key.startswith('linux-'):
        return ['linux']
    elif key.startswith('x11-'):
        return ['linux']
    return None


def is_repeatable(value_type: str) -> bool:
    """Determine if a value type is repeatable"""
    repeatable_types = [
        'repeatable-text',
        'keybinding',
    ]
    return value_type in repeatable_types


def generate_schema_json(
    categorization_file: Path,
    properties_file: Path,
    output_file: Path
):
    """Generate the final schema JSON"""

    print("🔍 Parsing properties file...")
    default_values, key_comments = parse_properties_file(properties_file)
    print(f"   Found {len(default_values)} default values")
    print(f"   Found {len([c for c in key_comments.values() if c])} comments")

    print("\n🔍 Loading categorization...")
    with open(categorization_file, 'r') as f:
        categorization = json.load(f)

    # Build the final schema
    schema = {
        "version": "1.0.0",
        "ghosttyVersion": "latest",
        "tabs": []
    }

    print("\n🔨 Building schema...")
    total_keys = 0
    total_comments = 0

    for tab in categorization['tabs']:
        new_tab = {
            "id": tab['id'],
            "label": tab['label'],
            "icon": tab['icon'],
            "sections": []
        }

        for section in tab['sections']:
            new_section = {
                "id": section['id'],
                "label": section['label'],
                "keys": []  # Will contain CommentBlock and ConfigProperty items
            }

            for key_obj in section['keys']:
                key = key_obj['key']
                value_type = key_obj['valueType']

                # Add comment block if exists
                if key in key_comments and key_comments[key]:
                    comment_block = {
                        "type": "comment",
                        "content": key_comments[key]
                    }
                    new_section['keys'].append(comment_block)
                    total_comments += 1

                # Build ConfigProperty
                # Check if this key is repeatable (has multiple values in properties file)
                is_key_repeatable = is_repeatable(value_type) or (key in default_values and len(default_values[key]) > 1)

                config_property = {
                    "type": "config",
                    "key": key,
                    "valueType": value_type,
                    "required": False,
                    "repeatable": is_key_repeatable
                }

                # Add default value if exists
                if key in default_values:
                    values = default_values[key]
                    # For repeatable keys, store ALL values as an array
                    # For non-repeatable keys, use the last value (in case of duplicates)
                    if is_key_repeatable:
                        config_property['defaultValue'] = values
                    else:
                        config_property['defaultValue'] = values[-1] if values else None

                # Add platform restrictions if applicable
                platforms = infer_platforms(key)
                if platforms:
                    config_property['platforms'] = platforms

                new_section['keys'].append(config_property)
                total_keys += 1

            new_tab['sections'].append(new_section)

        schema['tabs'].append(new_tab)

    # Write output
    print(f"\n💾 Writing to {output_file}...")
    with open(output_file, 'w') as f:
        json.dump(schema, f, indent=2)

    print("\n" + "="*70)
    print("SCHEMA GENERATION COMPLETE")
    print("="*70)
    print(f"✅ Total config keys: {total_keys}")
    print(f"✅ Total comment blocks: {total_comments}")
    print(f"✅ Total tabs: {len(schema['tabs'])}")
    print(f"✅ Output: {output_file}")
    print("="*70)


def main():
    categorization_file = Path('categorizedGhosttyConfigKeys.json')
    properties_file = Path('ghostty_default_docs.properties')
    output_file = Path('ghosttyConfigSchema.json')

    if not categorization_file.exists():
        print(f"❌ Error: {categorization_file} not found")
        return 1

    if not properties_file.exists():
        print(f"❌ Error: {properties_file} not found")
        return 1

    generate_schema_json(categorization_file, properties_file, output_file)
    return 0


if __name__ == '__main__':
    exit(main())
