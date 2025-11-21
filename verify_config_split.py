#!/usr/bin/env python3
"""
Verify that all keys from the original ghostty_config.properties file
are present in the split property files with matching values.
"""

import os
from pathlib import Path
from collections import defaultdict


def count_total_entries(properties):
    """Count total property entries, including duplicates (e.g., multiple palette entries)."""
    total = 0
    for key, value in properties.items():
        if isinstance(value, list):
            total += len(value)
        else:
            total += 1
    return total


def parse_properties_file(filepath):
    """Parse a properties file and return a dict of key-value pairs."""
    properties = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue
            
            # Split on first '=' only (values can contain '=')
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                # Handle duplicate keys (like palette entries)
                if key in properties:
                    # Convert to list if not already
                    if not isinstance(properties[key], list):
                        properties[key] = [properties[key]]
                    properties[key].append(value)
                else:
                    properties[key] = value
            else:
                print(f"Warning: Line {line_num} in {filepath} doesn't contain '=': {line}")
    
    return properties


def collect_split_properties(config_dir):
    """Collect all properties from all split property files.
    
    Excludes:
    - Files in the 'docs/' subdirectory
    - Files ending with '.docs.properties'
    """
    all_properties = {}
    file_mapping = defaultdict(list)  # Track which file each key comes from
    processed_files = []
    
    config_path = Path(config_dir)
    if not config_path.exists():
        raise FileNotFoundError(f"Directory {config_dir} does not exist")
    
    # Find all .properties files recursively
    for prop_file in config_path.rglob("*.properties"):
        # Skip docs folder
        if 'docs' in prop_file.parts:
            continue
        
        # Skip .docs.properties files
        if prop_file.name.endswith('.docs.properties'):
            continue
        
        props = parse_properties_file(prop_file)
        relative_path = prop_file.relative_to(config_path)
        processed_files.append(str(relative_path))
        
        for key, value in props.items():
            if key in all_properties:
                # Handle duplicate keys across files
                if not isinstance(all_properties[key], list):
                    all_properties[key] = [all_properties[key]]
                all_properties[key].append(value)
                file_mapping[key].append(str(relative_path))
            else:
                all_properties[key] = value
                file_mapping[key] = [str(relative_path)]
    
    return all_properties, file_mapping, processed_files


def collect_docs_properties(config_dir):
    """Collect all properties from files in the docs/ subdirectory."""
    all_properties = {}
    file_mapping = defaultdict(list)  # Track which file each key comes from
    processed_files = []
    
    config_path = Path(config_dir)
    docs_path = config_path / 'docs'
    
    if not docs_path.exists():
        raise FileNotFoundError(f"Directory {docs_path} does not exist")
    
    # Find all .properties files recursively in docs folder
    for prop_file in docs_path.rglob("*.properties"):
        props = parse_properties_file(prop_file)
        relative_path = prop_file.relative_to(config_path)
        processed_files.append(str(relative_path))
        
        for key, value in props.items():
            if key in all_properties:
                # Handle duplicate keys across files
                if not isinstance(all_properties[key], list):
                    all_properties[key] = [all_properties[key]]
                all_properties[key].append(value)
                file_mapping[key].append(str(relative_path))
            else:
                all_properties[key] = value
                file_mapping[key] = [str(relative_path)]
    
    return all_properties, file_mapping, processed_files


def compare_properties(original_props, split_props, file_mapping):
    """Compare original and split properties and report differences."""
    errors = []
    warnings = []
    
    # Check all original keys are present in split files
    missing_keys = []
    value_mismatches = []
    
    for key, original_value in original_props.items():
        if key not in split_props:
            missing_keys.append((key, original_value))
        else:
            split_value = split_props[key]
            # Compare values (handling lists for duplicate keys)
            if isinstance(original_value, list) and isinstance(split_value, list):
                if sorted(original_value) != sorted(split_value):
                    value_mismatches.append((key, original_value, split_value))
            elif isinstance(original_value, list) or isinstance(split_value, list):
                value_mismatches.append((key, original_value, split_value))
            elif original_value != split_value:
                value_mismatches.append((key, original_value, split_value))
    
    # Check for extra keys in split files (not in original)
    extra_keys = []
    for key in split_props:
        if key not in original_props:
            extra_keys.append((key, split_props[key]))
    
    return {
        'missing_keys': missing_keys,
        'value_mismatches': value_mismatches,
        'extra_keys': extra_keys,
        'file_mapping': file_mapping
    }


def verify_docs_folder(original_props, config_dir):
    """Verify that all keys and values are present in the docs/ folder."""
    print("\n" + "=" * 70)
    print("DOCS FOLDER VERIFICATION")
    print("=" * 70)
    print()
    
    # Collect docs properties
    print(f"Reading docs files from: {config_dir}/docs")
    try:
        docs_props, docs_file_mapping, processed_files = collect_docs_properties(config_dir)
        docs_total_entries = count_total_entries(docs_props)
        print(f"Processed {len(processed_files)} docs property files")
        print(f"Found {len(docs_props)} unique keys ({docs_total_entries} total entries) in docs files")
        print()
    except FileNotFoundError as e:
        print(f"ERROR: {e}")
        return None
    
    # Compare
    print("Comparing properties...")
    results = compare_properties(original_props, docs_props, docs_file_mapping)
    print()
    
    # Report results
    print("=" * 70)
    print("DOCS FOLDER VERIFICATION RESULTS")
    print("=" * 70)
    print()
    
    # Statistics
    total_original_keys = len(original_props)
    total_docs_keys = len(docs_props)
    total_original_entries = count_total_entries(original_props)
    total_docs_entries = count_total_entries(docs_props)
    matched_keys = total_original_keys - len(results['missing_keys']) - len(results['value_mismatches'])
    
    print(f"📊 STATISTICS:")
    print(f"   Original file:")
    print(f"     Unique keys:          {total_original_keys}")
    print(f"     Total entries:        {total_original_entries}")
    print(f"   Docs files:")
    print(f"     Unique keys:          {total_docs_keys}")
    print(f"     Total entries:        {total_docs_entries}")
    print(f"   Matched keys:          {matched_keys}")
    print(f"   Missing keys:           {len(results['missing_keys'])}")
    print(f"   Value mismatches:      {len(results['value_mismatches'])}")
    print(f"   Extra keys:            {len(results['extra_keys'])}")
    print()
    
    success = True
    
    # Missing keys
    if results['missing_keys']:
        success = False
        print(f"❌ MISSING KEYS ({len(results['missing_keys'])}):")
        print("   These keys exist in the original file but are missing from docs files:")
        for key, value in results['missing_keys']:
            print(f"   - {key} = {value}")
        print()
    else:
        print("✅ All keys from original file are present in docs files")
        print()
    
    # Value mismatches
    if results['value_mismatches']:
        success = False
        print(f"❌ VALUE MISMATCHES ({len(results['value_mismatches'])}):")
        print("   These keys have different values between original and docs files:")
        for key, orig_val, docs_val in results['value_mismatches']:
            print(f"   - {key}:")
            print(f"     Original: {orig_val}")
            print(f"     Docs:     {docs_val}")
            files = results['file_mapping'].get(key, ['unknown'])
            print(f"     Location: {', '.join(files)}")
        print()
    else:
        print("✅ All values match correctly")
        print()
    
    # Extra keys (warnings only)
    if results['extra_keys']:
        print(f"⚠️  EXTRA KEYS IN DOCS FILES ({len(results['extra_keys'])}):")
        print("   These keys exist in docs files but not in the original file:")
        for key, value in results['extra_keys']:
            files = results['file_mapping'].get(key, ['unknown'])
            print(f"   - {key} = {value}")
            print(f"     Location: {', '.join(files)}")
        print()
    
    # Summary
    print("=" * 70)
    if success and not results['extra_keys']:
        print("✅ DOCS VERIFICATION PASSED: All keys and values match perfectly!")
        print(f"   ✓ {matched_keys}/{total_original_keys} keys verified")
        print("=" * 70)
        return True
    elif success:
        print("✅ DOCS VERIFICATION PASSED: All original keys and values match!")
        print(f"   ✓ {matched_keys}/{total_original_keys} keys verified")
        print("⚠️  Note: Some extra keys found in docs files (see above)")
        print("=" * 70)
        return True
    else:
        print("❌ DOCS VERIFICATION FAILED: See errors above")
        print(f"   ✗ Only {matched_keys}/{total_original_keys} keys matched correctly")
        print("=" * 70)
        return False


def main():
    original_file = "ghostty_config.properties"
    config_dir = "ghostty_configs"
    
    print("=" * 70)
    print("Ghostty Config Split Verification")
    print("=" * 70)
    print()
    
    # Parse original file
    print(f"Reading original file: {original_file}")
    if not os.path.exists(original_file):
        print(f"ERROR: Original file '{original_file}' not found!")
        return 1
    
    original_props = parse_properties_file(original_file)
    original_unique_keys = len(original_props)
    original_total_entries = count_total_entries(original_props)
    print(f"Found {original_unique_keys} unique keys ({original_total_entries} total entries) in original file")
    print()
    
    # Collect split properties
    print(f"Reading split files from: {config_dir}")
    print("(Excluding 'docs/' folder and '.docs.properties' files)")
    try:
        split_props, file_mapping, processed_files = collect_split_properties(config_dir)
        split_total_entries = count_total_entries(split_props)
        print(f"Processed {len(processed_files)} property files")
        print(f"Found {len(split_props)} unique keys ({split_total_entries} total entries) in split files")
        print()
    except FileNotFoundError as e:
        print(f"ERROR: {e}")
        return 1
    
    # Compare
    print("Comparing properties...")
    results = compare_properties(original_props, split_props, file_mapping)
    print()
    
    # Report results
    print("=" * 70)
    print("VERIFICATION RESULTS")
    print("=" * 70)
    print()
    
    # Statistics
    total_original_keys = len(original_props)
    total_split_keys = len(split_props)
    total_original_entries = count_total_entries(original_props)
    total_split_entries = count_total_entries(split_props)
    matched_keys = total_original_keys - len(results['missing_keys']) - len(results['value_mismatches'])
    
    print(f"📊 STATISTICS:")
    print(f"   Original file:")
    print(f"     Unique keys:          {total_original_keys}")
    print(f"     Total entries:        {total_original_entries}")
    print(f"   Split files:")
    print(f"     Unique keys:          {total_split_keys}")
    print(f"     Total entries:        {total_split_entries}")
    print(f"   Matched keys:          {matched_keys}")
    print(f"   Missing keys:           {len(results['missing_keys'])}")
    print(f"   Value mismatches:      {len(results['value_mismatches'])}")
    print(f"   Extra keys:            {len(results['extra_keys'])}")
    print()
    
    success = True
    
    # Missing keys
    if results['missing_keys']:
        success = False
        print(f"❌ MISSING KEYS ({len(results['missing_keys'])}):")
        print("   These keys exist in the original file but are missing from split files:")
        for key, value in results['missing_keys']:
            print(f"   - {key} = {value}")
        print()
    else:
        print("✅ All keys from original file are present in split files")
        print()
    
    # Value mismatches
    if results['value_mismatches']:
        success = False
        print(f"❌ VALUE MISMATCHES ({len(results['value_mismatches'])}):")
        print("   These keys have different values between original and split files:")
        for key, orig_val, split_val in results['value_mismatches']:
            print(f"   - {key}:")
            print(f"     Original: {orig_val}")
            print(f"     Split:    {split_val}")
            files = results['file_mapping'].get(key, ['unknown'])
            print(f"     Location: {', '.join(files)}")
        print()
    else:
        print("✅ All values match correctly")
        print()
    
    # Extra keys (warnings only)
    if results['extra_keys']:
        print(f"⚠️  EXTRA KEYS IN SPLIT FILES ({len(results['extra_keys'])}):")
        print("   These keys exist in split files but not in the original file:")
        for key, value in results['extra_keys']:
            files = results['file_mapping'].get(key, ['unknown'])
            print(f"   - {key} = {value}")
            print(f"     Location: {', '.join(files)}")
        print()
    
    # Summary
    print("=" * 70)
    if success and not results['extra_keys']:
        print("✅ VERIFICATION PASSED: All keys and values match perfectly!")
        print(f"   ✓ {matched_keys}/{total_original_keys} keys verified")
        print("=" * 70)
    elif success:
        print("✅ VERIFICATION PASSED: All original keys and values match!")
        print(f"   ✓ {matched_keys}/{total_original_keys} keys verified")
        print("⚠️  Note: Some extra keys found in split files (see above)")
        print("=" * 70)
    else:
        print("❌ VERIFICATION FAILED: See errors above")
        print(f"   ✗ Only {matched_keys}/{total_original_keys} keys matched correctly")
        print("=" * 70)
    
    # Verify docs folder
    docs_success = verify_docs_folder(original_props, config_dir)
    
    # Final return code
    if not success:
        return 1
    if docs_success is False:
        return 1
    return 0


if __name__ == "__main__":
    exit(main())

