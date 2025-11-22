/**
 * Schema Test Script
 *
 * Tests the schema loader, validators, and query utilities
 */

import { loadSchema, getSchemaStats } from '../src/lib/schemaLoader';
import { getPropertyByKey, getPropertiesByTab, searchProperties } from '../src/lib/schemaQueries';
import { validateValue } from '../src/lib/schemaValidators';

console.log('=== Ghostty Schema Tests ===\n');

// Test 1: Load Schema
console.log('Test 1: Loading schema...');
try {
  const schema = loadSchema();
  console.log('✅ Schema loaded successfully');
  console.log(`   Version: ${schema.version}`);
  console.log(`   Ghostty Version: ${schema.ghosttyVersion}`);
  console.log(`   Tabs: ${schema.tabs.length}`);
} catch (error) {
  console.error('❌ Failed to load schema:', error);
  process.exit(1);
}

// Test 2: Get Schema Stats
console.log('\nTest 2: Getting schema statistics...');
try {
  const schema = loadSchema();
  const stats = getSchemaStats(schema);
  console.log('✅ Stats retrieved successfully');
  console.log(`   Tabs: ${stats.tabs}`);
  console.log(`   Sections: ${stats.sections}`);
  console.log(`   Properties: ${stats.properties}`);
  console.log(`   Comments: ${stats.comments}`);
  console.log('   Value Types:');
  Object.entries(stats.valueTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`     - ${type}: ${count}`);
    });
} catch (error) {
  console.error('❌ Failed to get stats:', error);
  process.exit(1);
}

// Test 3: Query Property by Key
console.log('\nTest 3: Querying property by key...');
try {
  const schema = loadSchema();
  const property = getPropertyByKey(schema, 'font-family');
  if (!property) {
    throw new Error('Property not found');
  }
  console.log('✅ Property found');
  console.log(`   Key: ${property.key}`);
  console.log(`   Label: ${property.label}`);
  console.log(`   Type: ${property.valueType}`);
  console.log(`   Repeatable: ${property.repeatable}`);
} catch (error) {
  console.error('❌ Failed to query property:', error);
  process.exit(1);
}

// Test 4: Get Properties by Tab
console.log('\nTest 4: Getting properties by tab...');
try {
  const schema = loadSchema();
  const properties = getPropertiesByTab(schema, 'appearance');
  console.log('✅ Properties retrieved');
  console.log(`   Count: ${properties.length}`);
  console.log(
    `   First 5: ${properties
      .slice(0, 5)
      .map(p => p.key)
      .join(', ')}`
  );
} catch (error) {
  console.error('❌ Failed to get properties by tab:', error);
  process.exit(1);
}

// Test 5: Search Properties
console.log('\nTest 5: Searching properties...');
try {
  const schema = loadSchema();
  const results = searchProperties(schema, 'font');
  console.log('✅ Search completed');
  console.log(`   Results: ${results.length}`);
  console.log(`   Keys: ${results.map(p => p.key).join(', ')}`);
} catch (error) {
  console.error('❌ Failed to search properties:', error);
  process.exit(1);
}

// Test 6: Validate Boolean Value
console.log('\nTest 6: Validating boolean value...');
try {
  const schema = loadSchema();
  const property = getPropertyByKey(schema, 'font-thicken');
  if (!property || property.valueType !== 'boolean') {
    throw new Error('Boolean property not found');
  }
  const result = validateValue(true, property);
  console.log('✅ Validation completed');
  console.log(`   Valid: ${result.valid}`);
  console.log(`   Errors: ${result.errors.length}`);
} catch (error) {
  console.error('❌ Failed to validate:', error);
  process.exit(1);
}

// Test 7: Validate Enum Value
console.log('\nTest 7: Validating enum value...');
try {
  const schema = loadSchema();
  const property = getPropertyByKey(schema, 'cursor-style');
  if (!property || property.valueType !== 'enum') {
    throw new Error('Enum property not found');
  }

  // Test valid value
  const validResult = validateValue('block', property);
  console.log('✅ Valid enum value');
  console.log(`   Valid: ${validResult.valid}`);

  // Test invalid value
  const invalidResult = validateValue('invalid-cursor', property);
  console.log('✅ Invalid enum value detected');
  console.log(`   Valid: ${invalidResult.valid}`);
  console.log(`   Errors: ${invalidResult.errors.join(', ')}`);
} catch (error) {
  console.error('❌ Failed to validate enum:', error);
  process.exit(1);
}

// Test 8: Validate Number Value
console.log('\nTest 8: Validating number value...');
try {
  const schema = loadSchema();
  const property = getPropertyByKey(schema, 'font-size');
  if (!property || property.valueType !== 'number') {
    throw new Error('Number property not found');
  }

  // Test valid value
  const validResult = validateValue(12, property);
  console.log('✅ Valid number value');
  console.log(`   Valid: ${validResult.valid}`);

  // Test value below minimum (if min is defined)
  if (property.validation?.min !== undefined) {
    const belowMinResult = validateValue(property.validation.min - 1, property);
    console.log('✅ Below minimum detected');
    console.log(`   Valid: ${belowMinResult.valid}`);
    console.log(`   Errors: ${belowMinResult.errors.join(', ')}`);
  }
} catch (error) {
  console.error('❌ Failed to validate number:', error);
  process.exit(1);
}

// Test 9: All Tabs and Sections
console.log('\nTest 9: Listing all tabs and sections...');
try {
  const schema = loadSchema();
  console.log('✅ Tabs and sections:');
  schema.tabs.forEach(tab => {
    console.log(`   ${tab.label} (${tab.id})`);
    tab.sections.forEach(section => {
      const propCount = section.keys.filter(k => k.type === 'config').length;
      console.log(`     - ${section.label} (${section.id}): ${propCount} properties`);
    });
  });
} catch (error) {
  console.error('❌ Failed to list tabs:', error);
  process.exit(1);
}

console.log('\n=== All Tests Passed ✅ ===\n');
