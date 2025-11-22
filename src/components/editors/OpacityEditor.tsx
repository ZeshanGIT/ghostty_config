import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface OpacityEditorProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
  error?: string;
}

export function OpacityEditor({
  value,
  onChange,
  label,
  disabled = false,
  error,
}: OpacityEditorProps) {
  // Convert 0.0-1.0 to 0-100 for slider
  const sliderValue = Math.round(value * 100);

  const handleSliderChange = (values: number[]) => {
    onChange(values[0] / 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= 0 && newValue <= 1) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={label} className="text-sm font-medium">
          {label}
        </Label>
        <Input
          id={`${label}-input`}
          type="number"
          value={value}
          onChange={handleInputChange}
          min={0}
          max={1}
          step={0.01}
          disabled={disabled}
          className="w-20 h-8 text-xs"
        />
      </div>
      <Slider
        id={label}
        value={[sliderValue]}
        onValueChange={handleSliderChange}
        min={0}
        max={100}
        step={1}
        disabled={disabled}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
