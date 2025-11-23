import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerFormat,
  ColorPickerOutput,
  ColorPickerEyeDropper,
} from '@/components/ui/shadcn-io/color-picker';
import Color from 'color';
import { useState, useCallback } from 'react';

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
  const [pickerColor, setPickerColor] = useState('#000000');

  // Normalize color value for display
  const normalizeColor = (color: string | undefined | null): string => {
    // Handle undefined, null, or empty string
    if (!color || typeof color !== 'string') return '#000000';
    // If it's a hex color, return it
    if (color.startsWith('#')) return color;
    // If it's a named color, try to convert to hex
    try {
      return Color(color).hex();
    } catch {
      // If conversion fails, return default
      return '#000000';
    }
  };

  const displayColor = normalizeColor(value);

  const handleInputChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleColorPickerChange = useCallback(
    (rgba: [number, number, number, number]) => {
      const color = Color.rgb(rgba[0], rgba[1], rgba[2]).alpha(rgba[3]);
      const hexColor = color.hex();
      setPickerColor(hexColor);
      setLocalValue(hexColor);
      onChange(hexColor);
    },
    [onChange]
  );

  const handlePopoverOpen = () => {
    setPickerColor(displayColor);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label} className="text-sm font-medium">
        {label}
      </Label>
      <div className="flex gap-2">
        <Popover onOpenChange={open => open && handlePopoverOpen()}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-12 h-10 rounded-md border-2 border-input transition-colors hover:border-ring disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: displayColor }}
              disabled={disabled}
              aria-label="Pick color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <ColorPicker
              value={pickerColor}
              onChange={handleColorPickerChange as (value: Parameters<typeof Color.rgb>[0]) => void}
            >
              <div className="space-y-4">
                <ColorPickerSelection className="h-40" />
                <div className="space-y-2">
                  <ColorPickerHue />
                  <ColorPickerAlpha />
                </div>
                <div className="flex items-center gap-2">
                  <ColorPickerFormat className="flex-1" />
                  <ColorPickerOutput />
                  <ColorPickerEyeDropper />
                </div>
              </div>
            </ColorPicker>
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
