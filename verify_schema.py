#!/usr/bin/env python3
"""
Verify the generated ghosttyConfigSchema.json
"""

import json
from pathlib import Path


def verify_schema(schema_file: Path, properties_file: Path):
    """Verify the generated schema"""

    print("🔍 Loading schema...")
    with open(schema_file, 'r') as f:
        schema = json.load(f)

    print("🔍 Extracting keys from properties file...")
    expected_keys = set()
    with open(properties_file, 'r') as f:
        for line in f:
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and '=' in stripped:
                key = stripped.split('=', 1)[0].strip()
                if key:
                    expected_keys.add(key)

    print("🔍 Extracting keys from schema...")
    schema_keys = set()
    comment_count = 0
    config_count = 0

    for tab in schema.get('tabs', []):
        for section in tab.get('sections', []):
            for item in section.get('keys', []):
                if item.get('type') == 'comment':
                    comment_count += 1
                elif item.get('type') == 'config':
                    config_count += 1
                    schema_keys.add(item.get('key'))

    # Compare
    missing_keys = expected_keys - schema_keys
    extra_keys = schema_keys - expected_keys

    print("\n" + "="*70)
    print("SCHEMA VERIFICATION")
    print("="*70)

    print(f"\n📊 Statistics:")
    print(f"   Expected keys: {len(expected_keys)}")
    print(f"   Schema keys: {len(schema_keys)}")
    print(f"   Comment blocks: {comment_count}")
    print(f"   Config properties: {config_count}")
    print(f"   Tabs: {len(schema.get('tabs', []))}")

    if not missing_keys and not extra_keys:
        print("\n✅ PERFECT MATCH! All keys are present in schema!")
    else:
        if missing_keys:
            print(f"\n❌ MISSING KEYS ({len(missing_keys)}):")
            for key in sorted(missing_keys):
                print(f"  • {key}")

        if extra_keys:
            print(f"\n⚠️  EXTRA KEYS ({len(extra_keys)}):")
            for key in sorted(extra_keys):
                print(f"  • {key}")

    # Check structure
    print(f"\n📋 Tab Breakdown:")
    for tab in schema.get('tabs', []):
        tab_config_count = 0
        tab_comment_count = 0
        for section in tab.get('sections', []):
            for item in section.get('keys', []):
                if item.get('type') == 'comment':
                    tab_comment_count += 1
                elif item.get('type') == 'config':
                    tab_config_count += 1

        print(f"   {tab['label']}: {tab_config_count} configs, {tab_comment_count} comments")

    print("\n" + "="*70)

    return 0 if not missing_keys and not extra_keys else 1


def main():
    schema_file = Path('ghosttyConfigSchema.json')
    properties_file = Path('ghostty_default_docs.properties')

    if not schema_file.exists():
        print(f"❌ Error: {schema_file} not found")
        return 1

    if not properties_file.exists():
        print(f"❌ Error: {properties_file} not found")
        return 1

    return verify_schema(schema_file, properties_file)


if __name__ == '__main__':
    exit(main())
