#!/usr/bin/env python3
"""
Verify and fix the ordering of keys in categorizedGhosttyConfigKeys.json
to match the order they appear in ghostty_default_docs.properties.

Within each section, keys should maintain the same relative order as they
appear in the original documentation file.
"""

import json
import re
from pathlib import Path
from typing import List, Dict, Tuple


def extract_key_order_from_docs(docs_file: Path) -> List[str]:
    """
    Extract the order of configuration keys from the documentation file.
    Returns a list of keys in the order they appear.
    """
    key_order = []

    with open(docs_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            # Match lines like "font-family = " or "palette = 0=#1d1f21"
            # Key definitions are lines that start with a key name followed by =
            if '=' in line and not line.startswith('#'):
                key = line.split('=')[0].strip()
                # Filter out palette indices like "palette = 0"
                # We only want the key name "palette"
                if key and not key[0].isdigit():
                    if key not in key_order:
                        key_order.append(key)

    return key_order


def get_key_position(key: str, key_order: List[str]) -> int:
    """
    Get the position of a key in the original documentation order.
    Returns -1 if the key is not found.
    """
    try:
        return key_order.index(key)
    except ValueError:
        return -1


def verify_section_ordering(
    section_name: str,
    section_keys: List[Dict[str, str]],
    key_order: List[str]
) -> Tuple[bool, List[str]]:
    """
    Verify that keys in a section are in the correct order.

    Returns:
        - is_ordered: True if the keys are in order, False otherwise
        - issues: List of issue descriptions
    """
    issues = []
    is_ordered = True

    # Extract just the key names from the section
    keys = [item['key'] for item in section_keys]

    # Get positions in the original order
    positions = []
    for key in keys:
        pos = get_key_position(key, key_order)
        if pos == -1:
            issues.append(f"  ⚠️  Key '{key}' not found in original documentation")
        positions.append(pos)

    # Check if positions are in ascending order (ignoring -1)
    valid_positions = [p for p in positions if p != -1]
    if valid_positions != sorted(valid_positions):
        is_ordered = False

        # Find the specific out-of-order keys
        for i in range(len(positions) - 1):
            if positions[i] != -1 and positions[i+1] != -1:
                if positions[i] > positions[i+1]:
                    issues.append(
                        f"  ❌ '{keys[i]}' (pos {positions[i]}) comes after "
                        f"'{keys[i+1]}' (pos {positions[i+1]}) but should come before"
                    )

    return is_ordered, issues


def reorder_section_keys(
    section_keys: List[Dict[str, str]],
    key_order: List[str]
) -> List[Dict[str, str]]:
    """
    Reorder keys in a section to match the original documentation order.
    Keys not found in the original order are placed at the end.
    """
    # Separate keys that exist in the original order from those that don't
    with_positions = []
    without_positions = []

    for item in section_keys:
        key = item['key']
        pos = get_key_position(key, key_order)
        if pos != -1:
            with_positions.append((pos, item))
        else:
            without_positions.append(item)

    # Sort by position
    with_positions.sort(key=lambda x: x[0])

    # Combine: ordered keys first, then keys not in original order
    return [item for _, item in with_positions] + without_positions


def main():
    # File paths
    docs_file = Path("ghostty_default_docs.properties")
    categorized_file = Path("categorizedGhosttyConfigKeys.json")

    if not docs_file.exists():
        print(f"❌ Error: {docs_file} not found")
        return 1

    if not categorized_file.exists():
        print(f"❌ Error: {categorized_file} not found")
        return 1

    # Extract key order from documentation
    print("📖 Reading key order from documentation...")
    key_order = extract_key_order_from_docs(docs_file)
    print(f"   Found {len(key_order)} keys in documentation\n")

    # Load categorized JSON
    print("📂 Loading categorized configuration...")
    with open(categorized_file, 'r', encoding='utf-8') as f:
        categorized = json.load(f)

    # Verify and collect issues
    all_issues = []
    sections_to_fix = []

    print("🔍 Verifying key ordering...\n")

    for tab in categorized['tabs']:
        tab_id = tab['id']
        tab_label = tab['label']

        for section in tab['sections']:
            section_id = section['id']
            section_label = section['label']
            section_path = f"{tab_label} > {section_label}"

            is_ordered, issues = verify_section_ordering(
                section_path,
                section['keys'],
                key_order
            )

            if not is_ordered or issues:
                print(f"📍 {section_path}")
                for issue in issues:
                    print(issue)
                print()

                if not is_ordered:
                    sections_to_fix.append((tab, section))
                    all_issues.extend(issues)

    # Summary
    if not all_issues:
        print("✅ All sections have keys in the correct order!")
        return 0
    else:
        print(f"\n⚠️  Found {len(sections_to_fix)} section(s) with ordering issues")
        print("\n🔧 Automatically reordering keys...")

        for tab, section in sections_to_fix:
            section_path = f"{tab['label']} > {section['label']}"
            print(f"   Fixing {section_path}")
            section['keys'] = reorder_section_keys(section['keys'], key_order)

        # Write back to file
        with open(categorized_file, 'w', encoding='utf-8') as f:
            json.dump(categorized, f, indent=2, ensure_ascii=False)
            f.write('\n')  # Add trailing newline

        print(f"\n✅ Fixed ordering and saved to {categorized_file}")
        return 0


if __name__ == "__main__":
    exit(main())
