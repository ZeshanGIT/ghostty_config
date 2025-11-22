#!/usr/bin/env tsx

/**
 * Schema Generator for Ghostty Config Editor
 *
 * This script parses ghostty_docs.txt and the .properties files in ghostty_configs/
 * to generate a TypeScript schema file at src/data/ghostty-schema.generated.ts
 *
 * Usage: pnpm tsx scripts/generateSchema.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface PropertyDoc {
  key: string;
  description: string;
  type: string;
  defaultValue: string | null;
  validation?: {
    min?: number;
    max?: number;
    enum?: string[];
  };
  isRepeatable: boolean;
  example?: string;
  platform?: string;
}

interface CategoryInfo {
  id: string;
  displayName: string;
  icon: string;
  sections: SectionInfo[];
}

interface SectionInfo {
  id: string;
  displayName: string;
  properties: string[];
}

const CATEGORY_ICONS: Record<string, string> = {
  appearance: 'Palette',
  window: 'RectangleHorizontal',
  terminal: 'Terminal',
  input: 'Keyboard',
  platform: 'Monitor',
  system: 'Settings',
  notifications: 'Bell',
  config: 'FileText',
  ui: 'Layout',
};

/**
 * Parse ghostty_docs.txt to extract property documentation
 */
function parseDocumentation(docsPath: string): Map<string, PropertyDoc> {
  const content = fs.readFileSync(docsPath, 'utf-8');
  const properties = new Map<string, PropertyDoc>();

  // Split into sections by ### headers
  const sections = content.split(/\n### /).slice(1);

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const propertyKey = lines[0].trim();

    const doc: PropertyDoc = {
      key: propertyKey,
      description: '',
      type: 'string',
      defaultValue: null,
      isRepeatable: false,
    };

    const descriptionLines: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('Type:')) {
        const typeValue = line.replace('Type:', '').trim();
        doc.type = typeValue;
        doc.isRepeatable = typeValue === 'repeatable';
      } else if (line.startsWith('Default:')) {
        const defaultValue = line.replace('Default:', '').trim();
        doc.defaultValue = defaultValue || null;
      } else if (line.startsWith('Min:')) {
        const minValue = parseFloat(line.replace('Min:', '').trim());
        doc.validation = doc.validation || {};
        doc.validation.min = minValue;
      } else if (line.startsWith('Max:')) {
        const maxValue = parseFloat(line.replace('Max:', '').trim());
        doc.validation = doc.validation || {};
        doc.validation.max = maxValue;
      } else if (line.startsWith('Options:')) {
        const optionsStr = line.replace('Options:', '').trim();
        const options = optionsStr.split(',').map(s => s.trim());
        doc.validation = doc.validation || {};
        doc.validation.enum = options;
      } else if (line.startsWith('Example:')) {
        doc.example = line.replace('Example:', '').trim();
      } else if (line.startsWith('Platform:')) {
        doc.platform = line.replace('Platform:', '').trim();
      } else if (line && !line.startsWith('#')) {
        descriptionLines.push(line);
      }
    }

    doc.description = descriptionLines.join(' ').trim();

    if (doc.key) {
      properties.set(doc.key, doc);
    }
  }

  return properties;
}

/**
 * Read .properties files to determine category/section organization
 */
function readCategoryStructure(configsDir: string): Map<string, CategoryInfo> {
  const categories = new Map<string, CategoryInfo>();

  const categoryDirs = fs.readdirSync(configsDir, { withFileTypes: true });

  for (const dir of categoryDirs) {
    if (!dir.isDirectory()) continue;

    const categoryId = dir.name;
    const categoryPath = path.join(configsDir, categoryId);
    const sections: SectionInfo[] = [];

    const sectionFiles = fs.readdirSync(categoryPath);

    for (const file of sectionFiles) {
      if (!file.endsWith('.properties')) continue;

      const sectionId = file.replace('.properties', '');
      const sectionPath = path.join(categoryPath, file);
      const content = fs.readFileSync(sectionPath, 'utf-8');

      // Each line is a property key
      const properties = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));

      sections.push({
        id: sectionId,
        displayName: toDisplayName(sectionId),
        properties,
      });
    }

    categories.set(categoryId, {
      id: categoryId,
      displayName: toDisplayName(categoryId),
      icon: CATEGORY_ICONS[categoryId] || 'Circle',
      sections,
    });
  }

  return categories;
}

/**
 * Convert kebab-case to Title Case
 */
function toDisplayName(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate TypeScript schema file
 */
function generateSchemaFile(
  propertyDocs: Map<string, PropertyDoc>,
  categories: Map<string, CategoryInfo>,
  outputPath: string
): void {
  const lines: string[] = [];

  // Header
  lines.push('/**');
  lines.push(' * Generated Ghostty Configuration Schema');
  lines.push(' *');
  lines.push(` * Generated on: ${new Date().toISOString()}`);
  lines.push(' *');
  lines.push(' * DO NOT EDIT THIS FILE MANUALLY - it is generated by scripts/generateSchema.ts');
  lines.push(' */');
  lines.push('');
  lines.push("import type { GhosttySchema, ConfigProperty } from '@/types/schema';");
  lines.push('');

  // Generate schema
  lines.push('export const GHOSTTY_SCHEMA: GhosttySchema = {');
  lines.push(`  version: '1.0.0',`);
  lines.push('  categories: [');

  for (const category of categories.values()) {
    lines.push('    {');
    lines.push(`      id: '${category.id}',`);
    lines.push(`      displayName: '${category.displayName}',`);
    lines.push(`      icon: '${category.icon}',`);
    lines.push('      sections: [');

    for (const section of category.sections) {
      lines.push('        {');
      lines.push(`          id: '${section.id}',`);
      lines.push(`          displayName: '${section.displayName}',`);
      lines.push('          properties: [');

      for (const propKey of section.properties) {
        const doc = propertyDocs.get(propKey);
        if (!doc) {
          console.warn(`Warning: No documentation found for ${propKey}`);
          continue;
        }

        lines.push('            {');
        lines.push(`              key: '${doc.key}',`);
        lines.push(`              displayName: '${toDisplayName(doc.key)}',`);
        lines.push(`              type: '${doc.type}',`);
        lines.push(`              category: '${category.id}',`);
        lines.push(`              section: '${section.id}',`);
        lines.push(`              description: ${JSON.stringify(doc.description)},`);
        lines.push(
          `              defaultValue: ${doc.defaultValue ? JSON.stringify(doc.defaultValue) : 'null'},`
        );
        lines.push(`              isRepeatable: ${doc.isRepeatable},`);

        if (doc.validation) {
          lines.push('              validation: {');
          if (doc.validation.min !== undefined) {
            lines.push(`                min: ${doc.validation.min},`);
          }
          if (doc.validation.max !== undefined) {
            lines.push(`                max: ${doc.validation.max},`);
          }
          if (doc.validation.enum) {
            lines.push(`                enum: ${JSON.stringify(doc.validation.enum)},`);
          }
          lines.push('              },');
        }

        if (doc.example) {
          lines.push(`              examples: [${JSON.stringify(doc.example)}],`);
        }

        if (doc.platform) {
          lines.push(`              platform: '${doc.platform}',`);
        }

        lines.push('            },');
      }

      lines.push('          ],');
      lines.push('        },');
    }

    lines.push('      ],');
    lines.push('    },');
  }

  lines.push('  ],');
  lines.push('};');
  lines.push('');

  // Generate property map for quick lookups
  lines.push('/**');
  lines.push(' * Quick lookup map of all properties by key');
  lines.push(' */');
  lines.push('export const PROPERTY_MAP = new Map<string, ConfigProperty>([');

  for (const category of categories.values()) {
    for (const section of category.sections) {
      for (const propKey of section.properties) {
        const doc = propertyDocs.get(propKey);
        if (!doc) continue;

        lines.push(`  [
  '${propKey}',
  GHOSTTY_SCHEMA.categories
    .find((c) => c.id === '${category.id}')!
    .sections.find((s) => s.id === '${section.id}')!
    .properties.find((p) => p.key === '${propKey}')!,
],`);
      }
    }
  }

  lines.push(']);');
  lines.push('');

  // Write file
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
}

/**
 * Main function
 */
function main() {
  const __filename = new URL(import.meta.url).pathname;
  const __dirname = path.dirname(__filename);
  const rootDir = path.resolve(__dirname, '..');
  const docsPath = path.join(rootDir, 'ghostty_docs.txt');
  const configsDir = path.join(rootDir, 'ghostty_configs');
  const outputPath = path.join(rootDir, 'src/data/ghostty-schema.generated.ts');

  console.log('Generating Ghostty configuration schema...');
  console.log(`  Docs: ${docsPath}`);
  console.log(`  Configs: ${configsDir}`);
  console.log(`  Output: ${outputPath}`);
  console.log('');

  // Parse documentation
  console.log('Parsing documentation...');
  const propertyDocs = parseDocumentation(docsPath);
  console.log(`  Found ${propertyDocs.size} properties`);

  // Read category structure
  console.log('Reading category structure...');
  const categories = readCategoryStructure(configsDir);
  console.log(`  Found ${categories.size} categories`);

  // Generate schema file
  console.log('Generating schema file...');
  generateSchemaFile(propertyDocs, categories, outputPath);
  console.log(`  ✓ Schema generated at ${outputPath}`);
  console.log('');
  console.log('Done!');
}

main();
