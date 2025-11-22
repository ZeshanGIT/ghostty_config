#!/usr/bin/env python3
"""
Parse command-palette-entry and keybind values and convert them to structured objects
"""

import json
import re
from pathlib import Path
from typing import Dict, Optional, List


def parse_keybinding(value: str) -> Optional[Dict[str, str]]:
    """
    Parse a keybind value string into a structured object.

    Format: key_combination=action

    Examples:
        super+d=new_split:right
        super+shift+d=new_split:down
        super+enter=toggle_fullscreen

    Returns: {"key": "...", "action": "..."}
    """
    if not value or not value.strip():
        return None

    # Split on the first '=' to separate key from action
    parts = value.split('=', 1)

    if len(parts) != 2:
        print(f"⚠️  Warning: Invalid keybind format (missing '='): {value}")
        return None

    key = parts[0].strip()
    action = parts[1].strip()

    if not key or not action:
        print(f"⚠️  Warning: Invalid keybind (empty key or action): {value}")
        return None

    return {
        "key": key,
        "action": action
    }


def parse_command_entry(value: str) -> Optional[Dict[str, str]]:
    """
    Parse a command-palette-entry value string into a structured object.

    Format: title:"...",description:"...",action:"..."
    Note: description is optional

    Examples:
        title:"Undo",description:"Undo the last action.",action:"undo"
        title:"Reset Font Style", action:csi:0m
        title:"Ghostty",action:"text:👻"

    Returns: {"title": "...", "description": "...", "action": "..."}
    """
    if not value or not value.strip():
        return None

    result = {}

    # Pattern to match key:"value" or key:value (for unquoted values)
    pattern = r'(\w+):((?:"[^"]*")|(?:[^,]+))'

    matches = re.findall(pattern, value)

    for key, val in matches:
        # Remove quotes if present
        if val.startswith('"') and val.endswith('"'):
            val = val[1:-1]

        result[key.strip()] = val.strip()

    # Validate required fields
    if 'title' not in result or 'action' not in result:
        print(f"⚠️  Warning: Invalid command entry (missing title or action): {value}")
        return None

    return result


def update_schema_with_structured_values(schema_file: Path):
    """
    Update the schema JSON file to convert:
    1. command-palette-entry values to structured CommandEntry objects
    2. keybind values to structured KeybindingEntry objects
    """

    print(f"📖 Reading schema from {schema_file}...")
    with open(schema_file, 'r') as f:
        schema = json.load(f)

    command_converted = 0
    command_total = 0
    keybind_converted = 0
    keybind_total = 0

    print("\n🔍 Searching for command-palette-entry and keybind keys...")

    for tab in schema.get('tabs', []):
        for section in tab.get('sections', []):
            for i, key_obj in enumerate(section.get('keys', [])):
                # Only process config keys
                if key_obj.get('type') != 'config':
                    continue

                key_name = key_obj.get('key')

                # Process command-palette-entry
                if key_name == 'command-palette-entry':
                    command_total += 1

                    # Convert valueType from repeatable-text to command
                    if key_obj.get('valueType') == 'repeatable-text':
                        key_obj['valueType'] = 'command'

                    # Parse the defaultValue if it's a string
                    default_value = key_obj.get('defaultValue')
                    if default_value and isinstance(default_value, str):
                        parsed = parse_command_entry(default_value)
                        if parsed:
                            key_obj['defaultValue'] = parsed
                            command_converted += 1
                            print(f"   ✅ Command: {parsed['title']}")
                        else:
                            print(f"   ❌ Failed to parse command: {default_value}")

                # Process keybind
                elif key_name == 'keybind':
                    keybind_total += 1

                    # Parse the defaultValue if it's a string
                    default_value = key_obj.get('defaultValue')
                    if default_value and isinstance(default_value, str):
                        parsed = parse_keybinding(default_value)
                        if parsed:
                            key_obj['defaultValue'] = parsed
                            keybind_converted += 1
                            print(f"   ✅ Keybind: {parsed['key']} = {parsed['action']}")
                        else:
                            print(f"   ❌ Failed to parse keybind: {default_value}")

    # Write updated schema
    print(f"\n💾 Writing updated schema to {schema_file}...")
    with open(schema_file, 'w') as f:
        json.dump(schema, f, indent=2)

    print("\n" + "="*70)
    print("STRUCTURED VALUE CONVERSION COMPLETE")
    print("="*70)
    print(f"✅ Command entries: {command_converted}/{command_total} converted")
    print(f"✅ Keybindings: {keybind_converted}/{keybind_total} converted")
    print("="*70)


def main():
    schema_file = Path('ghosttyConfigSchema.json')

    if not schema_file.exists():
        print(f"❌ Error: {schema_file} not found")
        return 1

    update_schema_with_structured_values(schema_file)
    return 0


if __name__ == '__main__':
    exit(main())
