/**
 * Enum Select Editor
 *
 * For enum properties with predefined options
 */

import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ConfigProperty } from '@/types/schema';

export interface EnumSelectProps {
  property: ConfigProperty;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function EnumSelect({ property, value, onChange, error }: EnumSelectProps) {
  const options = property.validation?.enum || [];

  const selectOptions = options.map(opt => ({
    value: opt,
    label: opt,
  }));

  return (
    <div className="space-y-2">
      <Label htmlFor={property.key}>{property.displayName}</Label>
      <Select
        id={property.key}
        value={value}
        onChange={e => onChange(e.target.value)}
        options={selectOptions}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {property.description && (
        <p className="text-sm text-muted-foreground">{property.description}</p>
      )}
    </div>
  );
}
