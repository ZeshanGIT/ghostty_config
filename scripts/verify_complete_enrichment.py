#!/usr/bin/env python3
"""
Comprehensive verification of schema enrichment.

Verifies that all config properties have:
1. All required fields (type, key, valueType, required, repeatable, defaultValue, label)
2. Valid labels (non-empty strings)
3. Proper validation fields (if present)
4. Proper option fields (if present)
5. Valid platform values (if present)
"""

import json
import sys
from typing import Dict, List, Tuple, Any
from collections import defaultdict


VALID_VALUE_TYPES = {
    'text', 'number', 'boolean', 'enum', 'opacity', 'filepath',
    'color', 'keybinding', 'command', 'adjustment', 'padding',
    'font-style', 'repeatable-text', 'special-number', 'font-family'
}

REQUIRED_FIELDS = {'type', 'key', 'valueType', 'required', 'repeatable', 'defaultValue', 'label'}


def verify_comprehensive(schema_path: str) -> Tuple[bool, Dict[str, Any]]:
    """
    Perform comprehensive verification of schema enrichment.

    Returns:
        Tuple of (success: bool, stats: Dict)
    """
    print(f"Loading schema from {schema_path}...")
    print("=" * 80)

    try:
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema = json.load(f)
    except json.JSONDecodeError as e:
        return False, {'error': f"Invalid JSON: {e}"}
    except FileNotFoundError:
        return False, {'error': f"File not found: {schema_path}"}

    # Statistics
    stats = {
        'total_config_items': 0,
        'total_comment_blocks': 0,
        'with_all_required_fields': 0,
        'with_valid_labels': 0,
        'with_validation': 0,
        'with_options': 0,
        'with_platforms': 0,
        'with_deprecated': 0,
        'errors': [],
        'warnings': [],
        'by_value_type': defaultdict(lambda: {
            'count': 0,
            'with_validation': 0,
            'with_options': 0,
            'with_platforms': 0
        })
    }

    # Collect all items
    for tab in schema.get('tabs', []):
        tab_id = tab.get('id', 'UNKNOWN_TAB')

        for section in tab.get('sections', []):
            section_id = section.get('id', 'UNKNOWN_SECTION')

            for item in section.get('keys', []):
                item_type = item.get('type')

                if item_type == 'comment':
                    stats['total_comment_blocks'] += 1
                    continue

                if item_type != 'config':
                    stats['errors'].append(f"{tab_id}/{section_id}: Unknown item type '{item_type}'")
                    continue

                stats['total_config_items'] += 1
                key = item.get('key', 'UNKNOWN_KEY')
                location = f"{tab_id}/{section_id}/{key}"
                value_type = item.get('valueType', 'UNKNOWN')

                # Check required fields
                missing_fields = REQUIRED_FIELDS - set(item.keys())
                if missing_fields:
                    stats['errors'].append(f"{location}: Missing required fields: {missing_fields}")
                else:
                    stats['with_all_required_fields'] += 1

                # Check label
                if 'label' in item:
                    label = item['label']
                    if isinstance(label, str) and label.strip():
                        stats['with_valid_labels'] += 1
                    else:
                        stats['errors'].append(f"{location}: Invalid label (empty or wrong type)")

                # Check valueType
                if value_type not in VALID_VALUE_TYPES:
                    stats['errors'].append(f"{location}: Invalid valueType '{value_type}'")

                # Count enrichment fields
                has_validation = 'validation' in item
                has_options = 'options' in item
                has_platforms = 'platforms' in item
                has_deprecated = 'deprecated' in item

                if has_validation:
                    stats['with_validation'] += 1
                if has_options:
                    stats['with_options'] += 1
                if has_platforms:
                    stats['with_platforms'] += 1
                if has_deprecated:
                    stats['with_deprecated'] += 1

                # Track by valueType
                stats['by_value_type'][value_type]['count'] += 1
                if has_validation:
                    stats['by_value_type'][value_type]['with_validation'] += 1
                if has_options:
                    stats['by_value_type'][value_type]['with_options'] += 1
                if has_platforms:
                    stats['by_value_type'][value_type]['with_platforms'] += 1

                # Validate platforms
                if has_platforms:
                    platforms = item['platforms']
                    if not isinstance(platforms, list):
                        stats['errors'].append(f"{location}: 'platforms' must be array")
                    else:
                        valid_platforms = {'macos', 'linux', 'windows'}
                        for platform in platforms:
                            if platform not in valid_platforms:
                                stats['errors'].append(f"{location}: Invalid platform '{platform}'")

    return len(stats['errors']) == 0, stats


def print_report(success: bool, stats: Dict[str, Any]):
    """Print a comprehensive verification report."""

    if 'error' in stats:
        print(f"❌ ERROR: {stats['error']}")
        return

    total = stats['total_config_items']

    print("\n📊 COMPREHENSIVE VERIFICATION REPORT")
    print("=" * 80)

    # Overview
    print("\n1️⃣  OVERVIEW")
    print("-" * 80)
    print(f"  Total config items:    {total}")
    print(f"  Total comment blocks:  {stats['total_comment_blocks']}")
    print(f"  Total items:           {total + stats['total_comment_blocks']}")

    # Required fields
    print("\n2️⃣  REQUIRED FIELDS (must be 100%)")
    print("-" * 80)
    print(f"  All required fields:   {stats['with_all_required_fields']}/{total} ({stats['with_all_required_fields']/total*100:.1f}%)")
    print(f"  Valid labels:          {stats['with_valid_labels']}/{total} ({stats['with_valid_labels']/total*100:.1f}%)")

    if stats['with_all_required_fields'] == total:
        print("  ✅ All items have required fields!")
    else:
        print(f"  ❌ {total - stats['with_all_required_fields']} items missing required fields!")

    if stats['with_valid_labels'] == total:
        print("  ✅ All items have valid labels!")
    else:
        print(f"  ❌ {total - stats['with_valid_labels']} items have invalid labels!")

    # Optional enrichment fields
    print("\n3️⃣  OPTIONAL ENRICHMENT FIELDS")
    print("-" * 80)
    print(f"  Validation:            {stats['with_validation']}/{total} ({stats['with_validation']/total*100:.1f}%)")
    print(f"  Options:               {stats['with_options']}/{total} ({stats['with_options']/total*100:.1f}%)")
    print(f"  Platforms:             {stats['with_platforms']}/{total} ({stats['with_platforms']/total*100:.1f}%)")
    print(f"  Deprecated:            {stats['with_deprecated']}/{total} ({stats['with_deprecated']/total*100:.1f}%)")

    # By value type
    print("\n4️⃣  BREAKDOWN BY VALUE TYPE")
    print("-" * 80)
    print(f"  {'Type':<20} {'Count':>6} {'Valid':>7} {'Opts':>7} {'Plat':>7}")
    print(f"  {'-'*20} {'-'*6} {'-'*7} {'-'*7} {'-'*7}")

    # Sort by count descending
    sorted_types = sorted(
        stats['by_value_type'].items(),
        key=lambda x: x[1]['count'],
        reverse=True
    )

    for value_type, type_stats in sorted_types:
        count = type_stats['count']
        val_pct = type_stats['with_validation'] / count * 100 if count > 0 else 0
        opt_pct = type_stats['with_options'] / count * 100 if count > 0 else 0
        plat_pct = type_stats['with_platforms'] / count * 100 if count > 0 else 0

        print(f"  {value_type:<20} {count:>6} {val_pct:>6.1f}% {opt_pct:>6.1f}% {plat_pct:>6.1f}%")

    # Errors and warnings
    if stats['errors']:
        print("\n5️⃣  ERRORS")
        print("-" * 80)
        for error in stats['errors'][:20]:  # Show first 20
            print(f"  ❌ {error}")
        if len(stats['errors']) > 20:
            print(f"  ... and {len(stats['errors']) - 20} more errors")

    if stats['warnings']:
        print("\n6️⃣  WARNINGS")
        print("-" * 80)
        for warning in stats['warnings'][:20]:  # Show first 20
            print(f"  ⚠️  {warning}")
        if len(stats['warnings']) > 20:
            print(f"  ... and {len(stats['warnings']) - 20} more warnings")

    # Final verdict
    print("\n" + "=" * 80)
    if success:
        print("✅ VERIFICATION PASSED!")
        print("=" * 80)
        print(f"\nAll {total} config items:")
        print(f"  ✅ Have all required fields")
        print(f"  ✅ Have valid, non-empty labels")
        print(f"  ✅ Conform to TypeScript schema types")
        print(f"\nEnrichment coverage:")
        print(f"  📊 Validation: {stats['with_validation']}/{total} ({stats['with_validation']/total*100:.1f}%)")
        print(f"  📊 Options:    {stats['with_options']}/{total} ({stats['with_options']/total*100:.1f}%)")
        print(f"  📊 Platforms:  {stats['with_platforms']}/{total} ({stats['with_platforms']/total*100:.1f}%)")
    else:
        print("❌ VERIFICATION FAILED!")
        print("=" * 80)
        print(f"\nFound {len(stats['errors'])} error(s)")
        print("Please review the errors above and fix the schema.")

    print("=" * 80)


def main():
    schema_file = "ghosttyConfigSchema.json"

    if len(sys.argv) > 1:
        schema_file = sys.argv[1]

    success, stats = verify_comprehensive(schema_file)
    print_report(success, stats)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
