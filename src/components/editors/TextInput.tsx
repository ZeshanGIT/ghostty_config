/**
 * Text Input Editor
 *
 * For string properties
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ConfigProperty } from '@/types/schema';

export interface TextInputProps {
  property: ConfigProperty;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TextInput({ property, value, onChange, error }: TextInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={property.key}>
        {property.displayName}
        {property.defaultValue && (
          <span className="text-xs text-muted-foreground ml-2">
            (default: {property.defaultValue})
          </span>
        )}
      </Label>
      <Input
        id={property.key}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={property.defaultValue || ''}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {property.description && (
        <p className="text-sm text-muted-foreground">{property.description}</p>
      )}
    </div>
  );
}
