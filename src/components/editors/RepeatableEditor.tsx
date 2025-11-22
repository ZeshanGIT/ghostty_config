/**
 * Repeatable Editor
 *
 * For repeatable properties (palette, keybind, etc.)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import type { ConfigProperty } from '@/types/schema';

export interface RepeatableEditorProps {
  property: ConfigProperty;
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
}

export function RepeatableEditor({ property, values, onChange, error }: RepeatableEditorProps) {
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newValue.trim()) {
      onChange([...values, newValue.trim()]);
      setNewValue('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);
  };

  return (
    <div className="space-y-2">
      <Label>{property.displayName}</Label>
      {property.description && (
        <p className="text-sm text-muted-foreground">{property.description}</p>
      )}

      {/* Existing values */}
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={value}
              onChange={e => handleUpdate(index, e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => handleRemove(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add new value */}
      <div className="flex gap-2">
        <Input
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          placeholder="Add new value..."
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="icon" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
