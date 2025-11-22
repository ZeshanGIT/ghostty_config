#!/usr/bin/env python3
"""
Enrich Ghostty Config Schema with Complete Metadata

This script adds missing fields to the JSON schema:
- label: Human-readable names
- description: Additional explanations (when needed)
- validation: Type-specific validation rules
- options: UI rendering options
- platforms: Platform restrictions
- deprecated: Deprecation flags
"""

import json
import re
from typing import Dict, Any, List, Optional

# ============================================================================
# Label Generation Rules
# ============================================================================

def generate_label(key: str) -> str:
    """Generate human-readable label from config key."""
    # Special cases that don't follow standard pattern
    special_labels = {
        "font-family": "Font Family",
        "font-family-bold": "Font Family (Bold)",
        "font-family-italic": "Font Family (Italic)",
        "font-family-bold-italic": "Font Family (Bold Italic)",
        "font-style": "Font Style",
        "font-style-bold": "Font Style (Bold)",
        "font-style-italic": "Font Style (Italic)",
        "font-style-bold-italic": "Font Style (Bold Italic)",
        "font-synthetic-style": "Synthetic Font Styles",
        "font-feature": "Font Features",
        "font-size": "Font Size",
        "font-variation": "Font Variations",
        "font-variation-bold": "Font Variations (Bold)",
        "font-variation-italic": "Font Variations (Italic)",
        "font-variation-bold-italic": "Font Variations (Bold Italic)",
        "font-codepoint-map": "Codepoint to Font Mapping",
        "font-thicken": "Thicken Font",
        "font-thicken-strength": "Thicken Strength",
        "font-shaping-break": "Font Shaping Break Points",
        "freetype-load-flags": "FreeType Load Flags",
        "window-title-font-family": "Window Title Font",
        "background": "Background Color",
        "foreground": "Foreground Color",
        "selection-foreground": "Selection Foreground",
        "selection-background": "Selection Background",
        "palette": "Color Palette",
        "minimum-contrast": "Minimum Contrast Ratio",
        "cursor-color": "Cursor Color",
        "cursor-opacity": "Cursor Opacity",
        "cursor-style": "Cursor Style",
        "cursor-style-blink": "Cursor Blink",
        "cursor-text": "Cursor Text Color",
        "cursor-click-to-move": "Click to Move Cursor",
        "alpha-blending": "Alpha Blending Mode",
        "background-opacity": "Background Opacity",
        "background-opacity-cells": "Apply Opacity to Cells",
        "background-blur": "Background Blur",
        "background-image": "Background Image",
        "background-image-opacity": "Background Image Opacity",
        "background-image-position": "Background Image Position",
        "background-image-fit": "Background Image Fit",
        "background-image-repeat": "Repeat Background Image",
        "unfocused-split-opacity": "Unfocused Split Opacity",
        "unfocused-split-fill": "Unfocused Split Fill Color",
        "split-divider-color": "Split Divider Color",
        "selection-clear-on-typing": "Clear Selection on Typing",
        "selection-clear-on-copy": "Clear Selection on Copy",
        "mouse-hide-while-typing": "Hide Mouse While Typing",
        "scroll-to-bottom": "Scroll to Bottom",
        "mouse-shift-capture": "Mouse Shift Capture",
        "mouse-scroll-multiplier": "Mouse Scroll Multiplier",
        "link-url": "Enable URL Links",
        "link-previews": "Show Link Previews",
        "theme": "Theme",
        "window-padding-x": "Horizontal Padding",
        "window-padding-y": "Vertical Padding",
        "window-padding-balance": "Balance Padding",
        "window-padding-color": "Padding Color",
        "window-vsync": "Vertical Sync",
        "window-inherit-working-directory": "Inherit Working Directory",
        "window-inherit-font-size": "Inherit Font Size",
        "window-decoration": "Window Decorations",
        "window-subtitle": "Window Subtitle",
        "window-theme": "Window Theme",
        "window-colorspace": "Window Color Space",
        "window-height": "Window Height",
        "window-width": "Window Width",
        "window-position-x": "Window X Position",
        "window-position-y": "Window Y Position",
        "maximize": "Start Maximized",
        "fullscreen": "Start Fullscreen",
        "title": "Window Title",
        "class": "Application Class",
        "x11-instance-name": "X11 Instance Name",
        "working-directory": "Working Directory",
        "keybind": "Keybinding",
        "command": "Shell Command",
        "initial-command": "Initial Command",
        "env": "Environment Variables",
        "input": "Startup Input",
        "wait-after-command": "Wait After Command",
        "abnormal-command-exit-runtime": "Abnormal Exit Threshold",
        "scrollback-limit": "Scrollback Limit",
        "grapheme-width-method": "Grapheme Width Method",
    }

    # Handle adjustment properties
    if key.startswith("adjust-"):
        part = key.replace("adjust-", "").replace("-", " ").title()
        return f"Adjust {part}"

    # Check special cases
    if key in special_labels:
        return special_labels[key]

    # Default: capitalize and replace hyphens with spaces
    return key.replace("-", " ").title()


# ============================================================================
# Platform Detection
# ============================================================================

def detect_platforms(comment: str) -> Optional[List[str]]:
    """Detect platform restrictions from comment block."""
    platforms = []
    comment_lower = comment.lower()

    if "only supported on macos" in comment_lower or "macos only" in comment_lower:
        return ["macos"]
    if "only supported on linux" in comment_lower or "linux only" in comment_lower:
        return ["linux"]
    if "only affects gtk" in comment_lower or "gtk only" in comment_lower:
        return ["linux"]  # GTK is Linux-specific

    # Check for platform mentions (but not exclusive)
    if "macos" in comment_lower:
        platforms.append("macos")
    if "linux" in comment_lower or "gtk" in comment_lower:
        platforms.append("linux")
    if "windows" in comment_lower:
        platforms.append("windows")

    return platforms if platforms else None


# ============================================================================
# Validation Rules by Type
# ============================================================================

def get_validation_for_type(key: str, value_type: str, default_value: Any) -> Optional[Dict[str, Any]]:
    """Generate validation rules based on valueType."""

    # Number validations
    if value_type == "number":
        validation = {}

        # Font size
        if key == "font-size":
            validation = {"min": 1, "max": 500, "positive": True, "unit": "pt"}

        # Font thicken strength
        elif key == "font-thicken-strength":
            validation = {"min": 0, "max": 255, "integer": True, "unit": ""}

        # Abnormal exit runtime
        elif key == "abnormal-command-exit-runtime":
            validation = {"min": 0, "integer": True, "unit": "ms"}

        # Scrollback limit
        elif key == "scrollback-limit":
            validation = {"min": 0, "integer": True, "unit": "bytes"}

        # Window dimensions
        elif key in ["window-height", "window-width"]:
            validation = {"min": 0, "integer": True, "unit": "cells"}

        # Window position
        elif key in ["window-position-x", "window-position-y"]:
            validation = {"integer": True, "unit": "px"}

        # Minimum contrast
        elif key == "minimum-contrast":
            validation = {"min": 1, "max": 21}

        return validation if validation else None

    # Opacity validations
    elif value_type == "opacity":
        if key == "cursor-opacity":
            return {"min": 0, "max": 1}
        elif key == "background-opacity":
            return {"min": 0, "max": 1}
        elif key == "background-image-opacity":
            return {"min": 0}  # Can be > 1
        elif key == "unfocused-split-opacity":
            return {"min": 0.15, "max": 1}

    # Enum validations
    elif value_type == "enum":
        validation = {"caseSensitive": False}

        # Font synthetic style allows multiple values
        if key == "font-synthetic-style":
            validation["allowNegation"] = True
            validation["separator"] = ","

        # Font shaping break
        elif key == "font-shaping-break":
            validation["allowNegation"] = True
            validation["separator"] = ","

        # FreeType flags
        elif key == "freetype-load-flags":
            validation["allowNegation"] = True
            validation["separator"] = ","

        # Alpha blending
        elif key == "alpha-blending":
            validation["caseSensitive"] = False

        # Mouse scroll multiplier
        elif key == "mouse-scroll-multiplier":
            validation["customPattern"] = r"^(precision:|discrete:)?[\d.]+$"

        return validation

    # Color validations
    elif value_type == "color":
        validation = {}

        # Selection colors can use special values
        if key in ["selection-foreground", "selection-background"]:
            validation["allowSpecialValues"] = ["cell-foreground", "cell-background"]

        # Cursor colors
        elif key in ["cursor-color", "cursor-text"]:
            validation["allowSpecialValues"] = ["cell-foreground", "cell-background"]

        return validation if validation else None

    # Text validations
    elif value_type == "text":
        if key == "theme":
            return {"pattern": r"^(light:.+,dark:.+|.+)$"}
        elif key == "class":
            return {"pattern": r"^[a-zA-Z][a-zA-Z0-9_.-]*$"}

    # Filepath validations
    elif value_type == "filepath":
        validation = {}

        if key == "background-image":
            validation["extensions"] = [".png", ".jpg", ".jpeg"]

        return validation if validation else None

    # Adjustment validations
    elif value_type == "adjustment":
        return {
            "allowPercentage": True,
            "allowInteger": True,
            "minPercentage": -100,
            "maxPercentage": 100
        }

    # Padding validations
    elif value_type == "padding":
        return {
            "allowPair": True,
            "min": 0
        }

    # Font style validations
    elif value_type == "font-style":
        return {
            "allowDisable": True,
            "allowDefault": True
        }

    # Repeatable text validations
    elif value_type == "repeatable-text":
        validation = {}

        if key == "font-feature":
            validation["format"] = "plain"
        elif key in ["font-variation", "font-variation-bold", "font-variation-italic", "font-variation-bold-italic"]:
            validation["format"] = "key-value"
        elif key == "font-codepoint-map":
            validation["format"] = "assignment"
        elif key == "env":
            validation["format"] = "key-value"

        validation["allowEmpty"] = True
        return validation

    # Keybinding validations
    elif value_type == "keybinding":
        return {
            "requireModifier": False,
            "allowSequences": True,
            "allowPrefixes": ["global:", "all:", "unconsumed:", "performable:"]
        }

    # Command validations
    elif value_type == "command":
        return {
            "allowPrefixes": ["direct:", "shell:"]
        }

    return None


# ============================================================================
# UI Options by Type
# ============================================================================

def get_options_for_type(key: str, value_type: str, default_value: Any) -> Optional[Dict[str, Any]]:
    """Generate UI options based on valueType."""

    # Number options
    if value_type == "number":
        options = {}

        if key == "font-size":
            options["step"] = 0.5
            options["showUnit"] = True
        elif key == "font-thicken-strength":
            options["step"] = 1
            options["showUnit"] = False

        return options if options else None

    # Opacity options
    elif value_type == "opacity":
        if key == "cursor-opacity":
            return {"min": 0, "max": 1, "step": 0.01}
        elif key == "background-opacity":
            return {"min": 0, "max": 1, "step": 0.01}
        elif key == "background-image-opacity":
            return {"min": 0, "max": 2, "step": 0.01}
        elif key == "unfocused-split-opacity":
            return {"min": 0.15, "max": 1, "step": 0.01}

    # Enum options
    elif value_type == "enum":
        options = {"allowCustom": False, "multiselect": False, "values": []}

        # Font synthetic style
        if key == "font-synthetic-style":
            options["multiselect"] = True
            options["values"] = [
                {"value": "bold", "description": "Synthesize bold style"},
                {"value": "italic", "description": "Synthesize italic style"},
                {"value": "bold-italic", "description": "Synthesize bold italic style"}
            ]

        # Font shaping break
        elif key == "font-shaping-break":
            options["multiselect"] = True
            options["values"] = [
                {"value": "cursor", "description": "Break runs under the cursor"}
            ]

        # FreeType load flags
        elif key == "freetype-load-flags":
            options["multiselect"] = True
            options["values"] = [
                {"value": "hinting", "description": "Enable font hinting"},
                {"value": "force-autohint", "description": "Always use FreeType auto-hinter"},
                {"value": "monochrome", "description": "1-bit monochrome rendering"},
                {"value": "autohint", "description": "Enable auto-hinter"}
            ]

        # Alpha blending
        elif key == "alpha-blending":
            options["values"] = [
                {"value": "native", "description": "Use native color space (Display P3 on macOS, sRGB on Linux)"},
                {"value": "linear", "description": "Linear space blending (eliminates darkening artifacts)"},
                {"value": "linear-corrected", "description": "Linear with correction for text"}
            ]

        # Cursor style
        elif key == "cursor-style":
            options["values"] = [
                {"value": "block", "description": "Block cursor"},
                {"value": "bar", "description": "Bar cursor"},
                {"value": "underline", "description": "Underline cursor"},
                {"value": "block_hollow", "description": "Hollow block cursor"}
            ]

        # Cursor style blink
        elif key == "cursor-style-blink":
            options["allowCustom"] = True
            options["values"] = [
                {"value": "", "description": "Default (blink enabled, respects DEC mode 12)"},
                {"value": "true", "description": "Always blink"},
                {"value": "false", "description": "Never blink"}
            ]

        # Scroll to bottom
        elif key == "scroll-to-bottom":
            options["multiselect"] = True
            options["values"] = [
                {"value": "keystroke", "description": "Scroll on keystroke"},
                {"value": "output", "description": "Scroll on output"}
            ]

        # Mouse shift capture
        elif key == "mouse-shift-capture":
            options["values"] = [
                {"value": "false", "description": "Shift extends selection (can be overridden)"},
                {"value": "true", "description": "Shift sent to program (can be overridden)"},
                {"value": "never", "description": "Always extend selection"},
                {"value": "always", "description": "Always send to program"}
            ]

        # Link previews
        elif key == "link-previews":
            options["values"] = [
                {"value": "true", "description": "Show previews for all links"},
                {"value": "false", "description": "Never show previews"},
                {"value": "osc8", "description": "Only show for OSC 8 hyperlinks"}
            ]

        # Window padding color
        elif key == "window-padding-color":
            options["values"] = [
                {"value": "background", "description": "Use background color"},
                {"value": "extend", "description": "Extend nearest grid cell color"},
                {"value": "extend-always", "description": "Always extend (no heuristics)"}
            ]

        # Window decoration
        elif key == "window-decoration":
            options["values"] = [
                {"value": "auto", "description": "Automatic (native look)"},
                {"value": "none", "description": "No decorations"},
                {"value": "client", "description": "Client-side decorations"},
                {"value": "server", "description": "Server-side decorations"}
            ]

        # Window subtitle
        elif key == "window-subtitle":
            options["values"] = [
                {"value": "false", "description": "No subtitle"},
                {"value": "working-directory", "description": "Show working directory"}
            ]

        # Window theme
        elif key == "window-theme":
            options["values"] = [
                {"value": "auto", "description": "Auto-detect from background color"},
                {"value": "system", "description": "Use system theme"},
                {"value": "light", "description": "Always use light theme"},
                {"value": "dark", "description": "Always use dark theme"},
                {"value": "ghostty", "description": "Use Ghostty config colors (Linux only)"}
            ]

        # Window colorspace
        elif key == "window-colorspace":
            options["values"] = [
                {"value": "srgb", "description": "sRGB color space"},
                {"value": "display-p3", "description": "Display P3 color space"}
            ]

        # Background image position
        elif key == "background-image-position":
            options["values"] = [
                {"value": "top-left"}, {"value": "top-center"}, {"value": "top-right"},
                {"value": "center-left"}, {"value": "center"}, {"value": "center-right"},
                {"value": "bottom-left"}, {"value": "bottom-center"}, {"value": "bottom-right"}
            ]

        # Background image fit
        elif key == "background-image-fit":
            options["values"] = [
                {"value": "contain", "description": "Scale to fit (preserves aspect ratio)"},
                {"value": "cover", "description": "Scale to fill (may clip)"},
                {"value": "stretch", "description": "Stretch to fill (ignores aspect ratio)"},
                {"value": "none", "description": "No scaling"}
            ]

        # Grapheme width method
        elif key == "grapheme-width-method":
            options["values"] = [
                {"value": "unicode", "description": "Use Unicode standard"},
                {"value": "legacy", "description": "Use legacy method (wcswidth)"}
            ]

        # Working directory
        elif key == "working-directory":
            options["allowCustom"] = True
            options["values"] = [
                {"value": "home", "description": "User home directory"},
                {"value": "inherit", "description": "Inherit from launching process"}
            ]

        # Mouse scroll multiplier
        elif key == "mouse-scroll-multiplier":
            options["allowCustom"] = True
            options["values"] = [
                {"value": "precision:1,discrete:3", "description": "Default (1x precision, 3x discrete)"}
            ]

        # Background blur
        elif key == "background-blur":
            options["allowCustom"] = True
            options["values"] = [
                {"value": "false", "description": "No blur"},
                {"value": "true", "description": "Default blur (intensity 20)"},
                {"value": "20", "description": "Blur intensity 20"}
            ]

        return options

    # Filepath options
    elif value_type == "filepath":
        if key == "background-image":
            return {"fileType": "image", "dialogTitle": "Select Background Image"}
        elif key == "working-directory":
            return {"fileType": "directory", "dialogTitle": "Select Working Directory"}

    # Color options
    elif value_type == "color":
        return {"format": "hex", "alpha": False}

    # Padding options
    elif value_type == "padding":
        if key == "window-padding-x":
            return {"allowPair": True, "labels": ["Left", "Right"]}
        elif key == "window-padding-y":
            return {"allowPair": True, "labels": ["Top", "Bottom"]}

    # Font style options
    elif value_type == "font-style":
        return {"allowDisable": True}

    # Repeatable text options
    elif value_type == "repeatable-text":
        options = {}

        if key in ["font-family", "font-family-bold", "font-family-italic", "font-family-bold-italic"]:
            options["placeholder"] = "Font family name"
            options["format"] = "plain"
            options["allowEmpty"] = True
        elif key == "font-feature":
            options["placeholder"] = "e.g., -calt, +liga"
            options["format"] = "plain"
        elif key in ["font-variation", "font-variation-bold", "font-variation-italic", "font-variation-bold-italic"]:
            options["placeholder"] = "e.g., wght=400"
            options["format"] = "key-value"
        elif key == "font-codepoint-map":
            options["placeholder"] = "e.g., U+E0A0-U+E0A3=Font Name"
            options["format"] = "assignment"
        elif key == "env":
            options["placeholder"] = "KEY=VALUE"
            options["format"] = "key-value"

        return options if options else None

    # Keybinding options
    elif value_type == "keybinding":
        return {"showPrefixes": True, "showSequences": True}

    # Command options
    elif value_type == "command":
        return {"showPrefixes": True}

    # Adjustment options
    elif value_type == "adjustment":
        return {"defaultUnit": "px"}

    # Special number options
    elif value_type == "special-number":
        if key == "mouse-scroll-multiplier":
            return {"specialFormats": ["precision:N,discrete:N"], "allowBoolean": False}
        elif key == "background-blur":
            return {"specialFormats": [], "allowBoolean": True}

    # Font family options
    elif value_type == "font-family":
        return {"allowSystemDefault": True}

    # Text options
    elif value_type == "text":
        options = {}

        if key == "title":
            options["placeholder"] = "Window title"
        elif key == "theme":
            options["placeholder"] = "Theme name or light:X,dark:Y"
        elif key == "class":
            options["placeholder"] = "com.example.app"
        elif key == "x11-instance-name":
            options["placeholder"] = "ghostty"

        return options if options else None

    return None


# ============================================================================
# Main Enrichment Function
# ============================================================================

def enrich_config_item(item: Dict[str, Any], prev_comment: Optional[str] = None) -> Dict[str, Any]:
    """Enrich a single config item with metadata."""
    if item["type"] != "config":
        return item

    key = item["key"]
    value_type = item["valueType"]
    default_value = item.get("defaultValue")

    # Add label
    item["label"] = generate_label(key)

    # Add description only if needed (not covered by comment block)
    # Most descriptions are in comment blocks, so we skip unless truly needed
    # This is left empty for now - add specific cases if needed

    # Add validation
    validation = get_validation_for_type(key, value_type, default_value)
    if validation:
        item["validation"] = validation

    # Add options
    options = get_options_for_type(key, value_type, default_value)
    if options:
        item["options"] = options

    # Add platform restrictions
    if prev_comment:
        platforms = detect_platforms(prev_comment)
        if platforms:
            item["platforms"] = platforms

    # Add deprecated flag (none currently deprecated)
    # item["deprecated"] = False

    return item


def enrich_schema(schema_path: str, output_path: str):
    """Enrich the entire schema file."""
    print(f"Loading schema from {schema_path}...")

    with open(schema_path, 'r', encoding='utf-8') as f:
        schema = json.load(f)

    total_items = 0
    enriched_items = 0

    # Process each tab -> section -> item
    for tab in schema["tabs"]:
        for section in tab["sections"]:
            prev_comment = None

            for i, item in enumerate(section["keys"]):
                total_items += 1

                # Track previous comment for platform detection
                if item["type"] == "comment":
                    prev_comment = item.get("content", "")
                elif item["type"] == "config":
                    # Enrich config item
                    section["keys"][i] = enrich_config_item(item, prev_comment)
                    enriched_items += 1
                    prev_comment = None  # Reset after config item

    print(f"Enriched {enriched_items} config items out of {total_items} total items")

    # Save enriched schema
    print(f"Saving enriched schema to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(schema, f, indent=4, ensure_ascii=False)

    print("✅ Schema enrichment complete!")


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    import sys

    schema_file = "ghosttyConfigSchema.json"
    output_file = "ghosttyConfigSchema.enriched.json"

    if len(sys.argv) > 1:
        schema_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]

    enrich_schema(schema_file, output_file)
