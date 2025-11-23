import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';

interface ColorEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

export function ColorEditor({
  value,
  onChange,
  label,
  disabled = false,
  error,
  placeholder = '#000000',
}: ColorEditorProps) {
  const [localValue, setLocalValue] = useState(value || '');

  // Normalize color value for display
  const normalizeColor = (color: string | undefined | null): string => {
    // Handle undefined, null, or empty string
    if (!color || typeof color !== 'string') return '#000000';
    // If it's a hex color, return it
    if (color.startsWith('#')) return color;
    // If it's a named color, we'll just show it as-is
    return color;
  };

  const displayColor = normalizeColor(value);
  const isHexColor = displayColor.startsWith('#');

  const handleInputChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hexColor = e.target.value;
    setLocalValue(hexColor);
    onChange(hexColor);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label} className="text-sm font-medium">
        {label}
      </Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-12 h-10 rounded-md border-2 border-input transition-colors hover:border-ring disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: displayColor }}
              disabled={disabled}
              aria-label="Pick color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-2">
              <Label htmlFor={`${label}-picker`}>Color Picker</Label>
              <input
                id={`${label}-picker`}
                type="color"
                value={isHexColor ? displayColor : '#000000'}
                onChange={handleColorPickerChange}
                className="w-full h-32 cursor-pointer"
                disabled={disabled}
              />
            </div>
          </PopoverContent>
        </Popover>
        <div className="flex-1">
          <Input
            id={label}
            type="text"
            value={localValue}
            onChange={e => handleInputChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className={error ? 'border-destructive' : ''}
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
