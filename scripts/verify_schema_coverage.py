#!/usr/bin/env python3
"""
Verify that all config keys from ghostty_default_docs.properties are covered in schema.ts
"""

import re
from pathlib import Path
from typing import Set


def extract_property_keys_from_config(config_file: Path) -> Set[str]:
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


def extract_property_keys_from_schema(schema_file: Path) -> Set[str]:
    """Extract all documented property keys from schema.ts comments"""
    keys = set()

    with open(schema_file, 'r') as f:
        content = f.read()

    # Pattern to match config key documentation in comments:
    # - key: description
    # - key-name: description
    pattern = r'^\s*\*\s*-\s*([a-z][a-z0-9-]*?)(?:\s*:\s*|,\s*)'

    for line in content.split('\n'):
        match = re.match(pattern, line)
        if match:
            key = match.group(1)
            keys.add(key)

    return keys


def main():
    config_file = Path('ghostty_default_docs.properties')
    schema_file = Path('src/types/schema.ts')

    if not config_file.exists():
        print(f"❌ Error: {config_file} not found")
        return 1

    if not schema_file.exists():
        print(f"❌ Error: {schema_file} not found")
        return 1

    print("🔍 Extracting config keys from ghostty_default_docs.properties...")
    config_keys = extract_property_keys_from_config(config_file)
    print(f"   Found {len(config_keys)} unique config keys")

    print("\n🔍 Extracting documented keys from schema.ts...")
    schema_keys = extract_property_keys_from_schema(schema_file)
    print(f"   Found {len(schema_keys)} documented keys")

    # Find missing keys
    missing_keys = config_keys - schema_keys
    extra_keys = schema_keys - config_keys

    print("\n" + "="*70)
    print("COVERAGE ANALYSIS")
    print("="*70)

    if not missing_keys:
        print("\n✅ ALL CONFIG KEYS ARE DOCUMENTED IN SCHEMA!")
    else:
        print(f"\n❌ MISSING KEYS ({len(missing_keys)}):")
        print("-" * 70)
        for key in sorted(missing_keys):
            print(f"  • {key}")

    if extra_keys:
        print(f"\n⚠️  EXTRA KEYS IN SCHEMA (not in config) ({len(extra_keys)}):")
        print("-" * 70)
        for key in sorted(extra_keys):
            print(f"  • {key}")

    # Calculate coverage percentage
    coverage = (len(config_keys) - len(missing_keys)) / len(config_keys) * 100
    print("\n" + "="*70)
    print(f"COVERAGE: {coverage:.1f}% ({len(config_keys) - len(missing_keys)}/{len(config_keys)} keys)")
    print("="*70)

    return 0 if not missing_keys else 1


if __name__ == '__main__':
    exit(main())
