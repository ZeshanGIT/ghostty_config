#!/usr/bin/env tsx

/**
 * Test script for parser and saver
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseConfigFile } from '../src/lib/parser/propertiesParser';
import { saveConfigFile, buildSaveOptions } from '../src/lib/parser/propertiesSaver';
import { PROPERTY_MAP } from '../src/data/ghostty-schema.generated';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const testConfigPath = path.join(rootDir, 'test-config.properties');

console.log('Testing parser and saver...\n');

// Read test config
const content = fs.readFileSync(testConfigPath, 'utf-8');
console.log('Original config:');
console.log('---');
console.log(content);
console.log('---\n');

// Parse it
console.log('Parsing config...');
const parsedFile = parseConfigFile(content, PROPERTY_MAP);

console.log(`  Found ${parsedFile.parseResult.valid.size} properties`);
console.log(`  Found ${parsedFile.parseResult.warnings.length} warnings`);
console.log(`  Found ${parsedFile.parseResult.invalid.length} invalid lines\n`);

// Print parsed properties
console.log('Parsed properties:');
for (const [key, value] of parsedFile.parseResult.valid) {
  console.log(`  ${key} = ${Array.isArray(value) ? value.join(', ') : value}`);
}
console.log('');

// Print warnings
if (parsedFile.parseResult.warnings.length > 0) {
  console.log('Warnings:');
  for (const warning of parsedFile.parseResult.warnings) {
    console.log(`  Line ${warning.lineNumber}: ${warning.message}`);
  }
  console.log('');
}

// Test 1: Save without modifications
console.log('Test 1: Save without modifications');
const saveOptions1 = buildSaveOptions(
  parsedFile,
  parsedFile.parseResult.valid,
  new Set(),
  PROPERTY_MAP
);
const saved1 = saveConfigFile(parsedFile, saveOptions1);
console.log('Result: Should be identical to original');
console.log('Match:', saved1.trim() === content.trim() ? '✓ PASS' : '✗ FAIL');
console.log('');

// Test 2: Modify a property
console.log('Test 2: Modify font-size from 14 to 16');
const modifiedConfig = new Map(parsedFile.parseResult.valid);
modifiedConfig.set('font-size', '16');
const modifiedKeys = new Set(['font-size']);

const saveOptions2 = buildSaveOptions(parsedFile, modifiedConfig, modifiedKeys, PROPERTY_MAP);
const saved2 = saveConfigFile(parsedFile, saveOptions2);

console.log('Modified config:');
console.log('---');
console.log(saved2);
console.log('---');
console.log('Check: Should have font-size = 16');
console.log('Match:', saved2.includes('font-size = 16') ? '✓ PASS' : '✗ FAIL');
console.log('');

// Test 3: Add a new property
console.log('Test 3: Add new property (background-opacity)');
const configWithNew = new Map(parsedFile.parseResult.valid);
configWithNew.set('background-opacity', '0.95');
const newKeys = new Set(['background-opacity']);

const saveOptions3 = buildSaveOptions(parsedFile, configWithNew, newKeys, PROPERTY_MAP);
const saved3 = saveConfigFile(parsedFile, saveOptions3);

console.log('Config with new property (last few lines):');
const lines = saved3.trim().split('\n');
console.log(lines.slice(-5).join('\n'));
console.log('Check: Should have background-opacity = 0.95');
console.log('Match:', saved3.includes('background-opacity = 0.95') ? '✓ PASS' : '✗ FAIL');
console.log('');

// Test 4: Remove a property
console.log('Test 4: Remove cursor-blink property');
const configWithRemoved = new Map(parsedFile.parseResult.valid);
configWithRemoved.delete('cursor-blink');
const removedKeys = new Set(['cursor-blink']);

const saveOptions4 = buildSaveOptions(parsedFile, configWithRemoved, removedKeys, PROPERTY_MAP);
const saved4 = saveConfigFile(parsedFile, saveOptions4);

console.log('Config with removed property:');
console.log('---');
console.log(saved4);
console.log('---');
console.log('Check: Should NOT have cursor-blink');
console.log('Match:', !saved4.includes('cursor-blink') ? '✓ PASS' : '✗ FAIL');
console.log('');

console.log('All tests completed!');
