/**
 * Number Input Editor
 *
 * For number properties with min/max validation
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ConfigProperty } from '@/types/schema';

export interface NumberInputProps {
  property: ConfigProperty;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function NumberInput({ property, value, onChange, error }: NumberInputProps) {
  const min = property.validation?.min;
  const max = property.validation?.max;

  return (
    <div className="space-y-2">
      <Label htmlFor={property.key}>
        {property.displayName}
        {min !== undefined && max !== undefined && (
          <span className="text-xs text-muted-foreground ml-2">
            ({min} - {max})
          </span>
        )}
        {min !== undefined && max === undefined && (
          <span className="text-xs text-muted-foreground ml-2">(min: {min})</span>
        )}
        {min === undefined && max !== undefined && (
          <span className="text-xs text-muted-foreground ml-2">(max: {max})</span>
        )}
      </Label>
      <Input
        id={property.key}
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={property.defaultValue || ''}
        min={min}
        max={max}
        step="any"
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {property.description && (
        <p className="text-sm text-muted-foreground">{property.description}</p>
      )}
    </div>
  );
}
