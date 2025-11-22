#!/usr/bin/env python3
"""
Verify that all config keys are present in the categorized JSON file
"""

import json
from pathlib import Path
from typing import Set


def extract_keys_from_properties(config_file: Path) -> Set[str]:
    """Extract all property keys from the .properties file"""
    keys = set()

    with open(config_file, 'r') as f:
        for line in f:
            line = line.strip()
            # Skip comments and empty lines
            if not line or line.startswith('#'):
                continue

            # Extract key from "key = value" or "key="
            if '=' in line:
                key = line.split('=')[0].strip()
                if key:
                    keys.add(key)

    return keys


def extract_keys_from_json(json_file: Path) -> Set[str]:
    """Extract all keys from the categorized JSON file"""
    keys = set()

    with open(json_file, 'r') as f:
        data = json.load(f)

    for tab in data.get('tabs', []):
        for section in tab.get('sections', []):
            for item in section.get('keys', []):
                # Handle both old format (string) and new format (object with 'key' field)
                if isinstance(item, str):
                    keys.add(item)
                elif isinstance(item, dict) and 'key' in item:
                    keys.add(item['key'])

    return keys


def main():
    config_file = Path('ghostty_default_docs.properties')
    json_file = Path('categorizedGhosttyConfigKeys.json')

    if not config_file.exists():
        print(f"❌ Error: {config_file} not found")
        return 1

    if not json_file.exists():
        print(f"❌ Error: {json_file} not found")
        return 1

    print("🔍 Extracting config keys from ghostty_default_docs.properties...")
    config_keys = extract_keys_from_properties(config_file)
    print(f"   Found {len(config_keys)} unique config keys")

    print("\n🔍 Extracting keys from categorizedGhosttyConfigKeys.json...")
    json_keys = extract_keys_from_json(json_file)
    print(f"   Found {len(json_keys)} categorized keys")

    # Find missing and extra keys
    missing_keys = config_keys - json_keys
    extra_keys = json_keys - config_keys

    print("\n" + "="*70)
    print("CATEGORIZATION VERIFICATION")
    print("="*70)

    if not missing_keys and not extra_keys:
        print("\n✅ PERFECT MATCH! All config keys are categorized!")
    else:
        if missing_keys:
            print(f"\n❌ MISSING KEYS ({len(missing_keys)}):")
            print("-" * 70)
            for key in sorted(missing_keys):
                print(f"  • {key}")

        if extra_keys:
            print(f"\n⚠️  EXTRA KEYS (not in config) ({len(extra_keys)}):")
            print("-" * 70)
            for key in sorted(extra_keys):
                print(f"  • {key}")

    # Calculate coverage percentage
    coverage = (len(config_keys) - len(missing_keys)) / len(config_keys) * 100
    print("\n" + "="*70)
    print(f"COVERAGE: {coverage:.1f}% ({len(config_keys) - len(missing_keys)}/{len(config_keys)} keys)")
    print("="*70)

    # Show tab and section breakdown
    if not missing_keys:
        print("\n📊 CATEGORIZATION BREAKDOWN:")
        print("-" * 70)
        with open(json_file, 'r') as f:
            data = json.load(f)

        total_keys = 0
        for tab in data.get('tabs', []):
            tab_key_count = sum(len(s.get('keys', [])) for s in tab.get('sections', []))
            total_keys += tab_key_count
            print(f"\n{tab['label']} ({tab_key_count} keys):")
            for section in tab.get('sections', []):
                section_keys = section.get('keys', [])
                print(f"  • {section['label']}: {len(section_keys)} keys")

        print(f"\n{'='*70}")
        print(f"TOTAL: {total_keys} keys across {len(data.get('tabs', []))} tabs")
        print(f"{'='*70}")

    return 0 if not missing_keys else 1


if __name__ == '__main__':
    exit(main())
