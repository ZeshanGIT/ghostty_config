#!/usr/bin/env python3
"""
Verify that ALL config properties have a label field.

This script checks every single config item in the schema to ensure
it has the required 'label' field with a non-empty value.
"""

import json
import sys
from typing import List, Tuple


def verify_all_labels(schema_path: str) -> Tuple[bool, List[str]]:
    """
    Verify all config items have labels.

    Returns:
        Tuple of (success: bool, errors: List[str])
    """
    print(f"Loading schema from {schema_path}...")

    try:
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema = json.load(f)
    except json.JSONDecodeError as e:
        return False, [f"Invalid JSON: {e}"]
    except FileNotFoundError:
        return False, [f"File not found: {schema_path}"]

    errors = []
    config_items = []

    # Collect all config items
    for tab in schema.get('tabs', []):
        tab_id = tab.get('id', 'UNKNOWN_TAB')

        for section in tab.get('sections', []):
            section_id = section.get('id', 'UNKNOWN_SECTION')

            for item in section.get('keys', []):
                if item.get('type') == 'config':
                    key = item.get('key', 'UNKNOWN_KEY')
                    location = f"{tab_id}/{section_id}/{key}"
                    config_items.append((location, key, item))

    print(f"\n📋 Found {len(config_items)} config items to check")
    print("=" * 80)

    # Check each config item for label
    missing_labels = []
    empty_labels = []
    invalid_type_labels = []

    for location, key, item in config_items:
        # Check if 'label' field exists
        if 'label' not in item:
            missing_labels.append(location)
            errors.append(f"❌ {location}: Missing 'label' field")
        else:
            label = item['label']

            # Check if label is a string
            if not isinstance(label, str):
                invalid_type_labels.append((location, type(label).__name__))
                errors.append(f"❌ {location}: 'label' is {type(label).__name__}, expected string")

            # Check if label is non-empty
            elif not label.strip():
                empty_labels.append(location)
                errors.append(f"❌ {location}: 'label' is empty string")

    # Print summary
    print(f"\n📊 Verification Results:")
    print("=" * 80)
    print(f"  Total config items:        {len(config_items)}")
    print(f"  ✅ With valid labels:       {len(config_items) - len(missing_labels) - len(empty_labels) - len(invalid_type_labels)}")
    print(f"  ❌ Missing 'label' field:   {len(missing_labels)}")
    print(f"  ❌ Empty 'label' values:    {len(empty_labels)}")
    print(f"  ❌ Invalid label types:     {len(invalid_type_labels)}")

    # Print detailed errors if any
    if errors:
        print(f"\n❌ Found {len(errors)} error(s):")
        print("=" * 80)
        for error in errors:
            print(f"  {error}")
        return False, errors

    # Success!
    print(f"\n✅ SUCCESS! All {len(config_items)} config items have valid labels!")
    print("=" * 80)

    # Print some example labels
    print(f"\n📝 Sample labels:")
    print("=" * 80)
    for i, (location, key, item) in enumerate(config_items[:10]):
        print(f"  {key:30} → {item['label']}")

    if len(config_items) > 10:
        print(f"  ... and {len(config_items) - 10} more")

    return True, []


def main():
    schema_file = "ghosttyConfigSchema.json"

    if len(sys.argv) > 1:
        schema_file = sys.argv[1]

    success, errors = verify_all_labels(schema_file)

    if success:
        print("\n" + "=" * 80)
        print("✅ VERIFICATION PASSED: All config properties have labels!")
        print("=" * 80)
        sys.exit(0)
    else:
        print("\n" + "=" * 80)
        print("❌ VERIFICATION FAILED: Some config properties are missing labels!")
        print("=" * 80)
        sys.exit(1)


if __name__ == "__main__":
    main()
