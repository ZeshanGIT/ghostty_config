#!/usr/bin/env python3
"""
Generate a .docs.properties file by combining properties from a .properties file
with their documentation from ghostty_docs.txt
"""

import os
from pathlib import Path


def parse_docs_file(docs_path):
    """
    Parse ghostty_docs.txt and build a map of property names to their documentation blocks.
    
    Returns:
        dict: Mapping of property_name -> documentation_block (as string)
    """
    docs_map = {}
    current_doc_block = []
    
    with open(docs_path, 'r', encoding='utf-8') as f:
        for line in f:
            stripped = line.rstrip('\n\r')
            
            if stripped.startswith('#'):
                # Collect documentation lines
                current_doc_block.append(stripped)
            elif '=' in stripped and not stripped.startswith('#'):
                # This is a property definition
                # Extract property name (part before '=')
                property_name = stripped.split('=', 1)[0].strip()
                
                # Assign accumulated docs to this property
                if current_doc_block:
                    # Only assign docs if we have them (don't overwrite existing docs for duplicate keys)
                    docs_map[property_name] = '\n'.join(current_doc_block)
                    current_doc_block = []  # Reset for next property
                else:
                    # Property without preceding docs - only set to None if key doesn't exist yet
                    # This prevents overwriting docs for duplicate keys (like palette entries)
                    if property_name not in docs_map:
                        docs_map[property_name] = None
            else:
                # Blank line or other content - reset doc block if we hit a blank line
                # after a doc block but before a property (shouldn't happen, but handle it)
                if stripped.strip() == '' and current_doc_block:
                    # Keep the doc block, blank lines are part of formatting
                    pass
                elif not stripped.startswith('#') and current_doc_block:
                    # Non-comment, non-property line - reset doc block
                    current_doc_block = []
    
    return docs_map


def parse_properties_file(properties_path):
    """
    Parse a .properties file and extract property names and values.
    
    Returns:
        list: List of tuples (property_name, property_line)
    """
    properties = []
    
    with open(properties_path, 'r', encoding='utf-8') as f:
        for line in f:
            stripped = line.rstrip('\n\r')
            
            # Skip blank lines
            if not stripped.strip():
                properties.append((None, ''))  # Mark as blank line
                continue
            
            if '=' in stripped:
                property_name = stripped.split('=', 1)[0].strip()
                properties.append((property_name, stripped))
            else:
                # Line without '=' - preserve as-is
                properties.append((None, stripped))
    
    return properties


def generate_docs_properties(properties_path, docs_map, output_path):
    """
    Generate a .docs.properties file combining properties with their documentation.
    
    Args:
        properties_path: Path to the input .properties file
        docs_map: Dictionary mapping property names to their documentation blocks
        output_path: Path where the output .docs.properties file should be written
    """
    # Parse properties file
    print(f"Parsing properties from {properties_path}...")
    properties = parse_properties_file(properties_path)
    prop_count = len([p for p in properties if p[0] is not None])
    print(f"Found {prop_count} properties")
    
    # Generate output
    print(f"Generating {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as out:
        for property_name, property_line in properties:
            if property_name is None:
                # Blank line or non-property line - preserve as-is
                out.write(property_line + '\n')
            else:
                # Look up documentation
                docs = docs_map.get(property_name)
                
                if docs:
                    # Write documentation block
                    out.write(docs + '\n')
                
                # Write property line
                out.write(property_line + '\n')
                
                # Add blank line after property (for readability)
                out.write('\n')
    
    print(f"Successfully generated {output_path}")


def find_all_properties_files(configs_dir):
    """
    Find all .properties files in the configs directory, excluding .docs.properties files.
    
    Returns:
        list: List of Path objects for all .properties files
    """
    properties_files = []
    configs_path = Path(configs_dir)
    
    # Find all .properties files recursively
    for prop_file in configs_path.rglob('*.properties'):
        # Skip .docs.properties files
        if not prop_file.name.endswith('.docs.properties'):
            properties_files.append(prop_file)
    
    return sorted(properties_files)


def main():
    # Get the script directory (where the script is located)
    script_dir = Path(__file__).parent.absolute()
    
    # Define paths
    docs_path = script_dir / 'ghostty_docs.txt'
    configs_dir = script_dir / 'ghostty_configs'
    docs_output_dir = configs_dir / 'docs'
    
    # Check if docs file exists
    if not docs_path.exists():
        print(f"Error: {docs_path} not found!")
        return 1
    
    if not configs_dir.exists():
        print(f"Error: {configs_dir} not found!")
        return 1
    
    # Parse documentation once (shared across all files)
    print("=" * 70)
    print("Parsing documentation from ghostty_docs.txt...")
    print("=" * 70)
    docs_map = parse_docs_file(docs_path)
    docs_count = len([v for v in docs_map.values() if v is not None])
    print(f"Found documentation for {docs_count} properties\n")
    
    # Find all properties files
    properties_files = find_all_properties_files(configs_dir)
    
    if not properties_files:
        print("No .properties files found!")
        return 1
    
    print(f"Found {len(properties_files)} .properties files to process\n")
    
    # Process each properties file
    success_count = 0
    error_count = 0
    
    for prop_file in properties_files:
        try:
            # Calculate relative path from configs_dir
            rel_path = prop_file.relative_to(configs_dir)
            
            # Create output path in docs directory, mirroring the structure
            output_file = docs_output_dir / rel_path
            
            # Create parent directories if they don't exist
            output_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Generate the docs properties file
            print(f"Processing: {rel_path}")
            generate_docs_properties(prop_file, docs_map, output_file)
            success_count += 1
            print()
            
        except Exception as e:
            print(f"Error processing {prop_file}: {e}")
            import traceback
            traceback.print_exc()
            error_count += 1
            print()
    
    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Successfully processed: {success_count} files")
    if error_count > 0:
        print(f"Errors: {error_count} files")
    print(f"Output directory: {docs_output_dir}")
    
    return 0 if error_count == 0 else 1


if __name__ == '__main__':
    exit(main())

