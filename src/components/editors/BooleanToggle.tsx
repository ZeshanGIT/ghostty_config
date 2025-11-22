/**
 * Boolean Toggle Editor
 *
 * For boolean properties (true/false)
 */

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { ConfigProperty } from '@/types/schema';

export interface BooleanToggleProps {
  property: ConfigProperty;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function BooleanToggle({ property, value, onChange, error }: BooleanToggleProps) {
  const isChecked = value.toLowerCase() === 'true';

  const handleChange = (checked: boolean) => {
    onChange(checked ? 'true' : 'false');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor={property.key}>{property.displayName}</Label>
          {property.description && (
            <p className="text-sm text-muted-foreground">{property.description}</p>
          )}
        </div>
        <Switch id={property.key} checked={isChecked} onCheckedChange={handleChange} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
