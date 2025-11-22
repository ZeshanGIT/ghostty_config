#!/usr/bin/env python3
"""
Parse command-palette-entry and keybind values and convert them to structured objects
"""

import json
import re
from pathlib import Path
from typing import Dict, Optional, List


def parse_key_combo(key_str: str) -> Dict:
    """
    Parse a key combination string into modifiers and key.

    Examples:
        "super+d" -> {"modifiers": ["super"], "key": "d"}
        "super+shift+d" -> {"modifiers": ["super", "shift"], "key": "d"}
        "enter" -> {"modifiers": [], "key": "enter"}

    Returns: {"modifiers": [...], "key": "..."}
    """
    parts = key_str.split('+')

    if len(parts) == 1:
        # No modifiers, just a key
        return {
            "modifiers": [],
            "key": parts[0]
        }
    else:
        # Last part is the key, everything else is modifiers
        return {
            "modifiers": parts[:-1],
            "key": parts[-1]
        }


def parse_keybinding(value: str) -> Optional[Dict]:
    """
    Parse a keybind value string into a structured object.

    Format: key_combination=action

    Examples:
        super+d=new_split:right
        super+shift+d=new_split:down
        super+enter=toggle_fullscreen

    Returns: {"keyCombo": {"modifiers": [...], "key": "..."}, "action": "..."}
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

    # Parse the key combo
    key_combo = parse_key_combo(key)

    return {
        "keyCombo": key_combo,
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

                    default_value = key_obj.get('defaultValue')

                    # Parse if it's an array of strings
                    if default_value and isinstance(default_value, list):
                        parsed_list = []
                        for val in default_value:
                            if isinstance(val, str):
                                parsed = parse_command_entry(val)
                                if parsed:
                                    parsed_list.append(parsed)
                                    print(f"   ✅ Command: {parsed['title']}")
                                else:
                                    print(f"   ❌ Failed to parse command: {val}")
                            else:
                                # Already parsed, keep as-is
                                parsed_list.append(val)
                        key_obj['defaultValue'] = parsed_list
                        command_converted += len(parsed_list)

                    # Parse if it's a single string
                    elif default_value and isinstance(default_value, str):
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

                    default_value = key_obj.get('defaultValue')

                    # Parse if it's an array of strings
                    if default_value and isinstance(default_value, list):
                        parsed_list = []
                        for val in default_value:
                            if isinstance(val, str):
                                parsed = parse_keybinding(val)
                                if parsed:
                                    parsed_list.append(parsed)
                                    modifiers_str = '+'.join(parsed['keyCombo']['modifiers']) + '+' if parsed['keyCombo']['modifiers'] else ''
                                    print(f"   ✅ Keybind: {modifiers_str}{parsed['keyCombo']['key']} = {parsed['action']}")
                                else:
                                    print(f"   ❌ Failed to parse keybind: {val}")
                            elif isinstance(val, dict) and 'key' in val and 'keyCombo' not in val:
                                # Convert old format
                                key_combo = parse_key_combo(val['key'])
                                parsed = {
                                    'keyCombo': key_combo,
                                    'action': val['action']
                                }
                                parsed_list.append(parsed)
                                modifiers_str = '+'.join(key_combo['modifiers']) + '+' if key_combo['modifiers'] else ''
                                print(f"   ✅ Keybind: {modifiers_str}{key_combo['key']} = {val['action']}")
                            else:
                                # Already parsed, keep as-is
                                parsed_list.append(val)
                        key_obj['defaultValue'] = parsed_list
                        keybind_converted += len(parsed_list)

                    # Parse if it's a single string
                    elif default_value and isinstance(default_value, str):
                        parsed = parse_keybinding(default_value)
                        if parsed:
                            key_obj['defaultValue'] = parsed
                            keybind_converted += 1
                            modifiers_str = '+'.join(parsed['keyCombo']['modifiers']) + '+' if parsed['keyCombo']['modifiers'] else ''
                            print(f"   ✅ Keybind: {modifiers_str}{parsed['keyCombo']['key']} = {parsed['action']}")
                        else:
                            print(f"   ❌ Failed to parse keybind: {default_value}")

                    # Convert old format {"key": "...", "action": "..."} to new format
                    elif default_value and isinstance(default_value, dict) and 'key' in default_value and 'keyCombo' not in default_value:
                        key_combo = parse_key_combo(default_value['key'])
                        key_obj['defaultValue'] = {
                            'keyCombo': key_combo,
                            'action': default_value['action']
                        }
                        keybind_converted += 1
                        modifiers_str = '+'.join(key_combo['modifiers']) + '+' if key_combo['modifiers'] else ''
                        print(f"   ✅ Keybind: {modifiers_str}{key_combo['key']} = {default_value['action']}")

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
