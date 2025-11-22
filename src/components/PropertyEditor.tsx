/**
 * Property Editor Component
 *
 * Smart wrapper that renders the correct editor based on property type
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Trash2 } from 'lucide-react';
import { validateProperty } from '@/lib/validation';
import { useConfigStore } from '@/stores/configStore';
import type { ConfigProperty } from '@/types/schema';

import { TextInput } from '@/components/editors/TextInput';
import { NumberInput } from '@/components/editors/NumberInput';
import { BooleanToggle } from '@/components/editors/BooleanToggle';
import { EnumSelect } from '@/components/editors/EnumSelect';
import { RepeatableEditor } from '@/components/editors/RepeatableEditor';

export interface PropertyEditorProps {
  property: ConfigProperty;
}

export function PropertyEditor({ property }: PropertyEditorProps) {
  const { config, updateProperty, removeProperty, resetProperty } = useConfigStore();

  const currentValue = config.get(property.key);
  const stringValue = Array.isArray(currentValue) ? currentValue[0] || '' : currentValue || '';
  const arrayValue = Array.isArray(currentValue)
    ? currentValue
    : currentValue
      ? [currentValue]
      : [];

  // Validate current value
  const validationResult = validateProperty(property, stringValue);
  const error = validationResult.valid ? undefined : validationResult.error;

  // Handle value change
  const handleChange = (value: string | string[]) => {
    updateProperty(property.key, value);
  };

  // Handle reset to default
  const handleReset = () => {
    resetProperty(property.key);
  };

  // Handle remove
  const handleRemove = () => {
    removeProperty(property.key);
  };

  // Render appropriate editor based on type
  const renderEditor = () => {
    if (property.isRepeatable) {
      return (
        <RepeatableEditor
          property={property}
          values={arrayValue}
          onChange={handleChange}
          error={error}
        />
      );
    }

    switch (property.type) {
      case 'number':
        return (
          <NumberInput
            property={property}
            value={stringValue}
            onChange={handleChange}
            error={error}
          />
        );

      case 'boolean':
        return (
          <BooleanToggle
            property={property}
            value={stringValue}
            onChange={handleChange}
            error={error}
          />
        );

      case 'enum':
        return (
          <EnumSelect
            property={property}
            value={stringValue}
            onChange={handleChange}
            error={error}
          />
        );

      case 'string':
      default:
        return (
          <TextInput
            property={property}
            value={stringValue}
            onChange={handleChange}
            error={error}
          />
        );
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {renderEditor()}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-3 w-3" />
            Reset to Default
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="flex items-center gap-2 text-destructive"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </Button>
        </div>
      </div>
    </Card>
  );
}
