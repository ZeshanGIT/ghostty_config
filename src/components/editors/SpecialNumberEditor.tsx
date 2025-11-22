import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SpecialNumberEditorProps {
  value: string | number;
  onChange: (value: string | number) => void;
  label: string;
  specialValues?: string[];
  min?: number;
  max?: number;
  disabled?: boolean;
  error?: string;
}

export function SpecialNumberEditor({
  value,
  onChange,
  label,
  specialValues = ['unlimited'],
  min,
  max,
  disabled = false,
  error,
}: SpecialNumberEditorProps) {
  const isSpecialValue = typeof value === 'string' && specialValues.includes(value);
  const mode = isSpecialValue ? 'special' : 'number';

  const handleModeChange = (newMode: string) => {
    if (newMode === 'special') {
      onChange(specialValues[0]);
    } else {
      onChange(min || 0);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  const handleSpecialChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label} className="text-sm font-medium">
        {label}
      </Label>
      <div className="flex gap-2">
        <Select value={mode} onValueChange={handleModeChange} disabled={disabled}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="special">Special</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1">
          {mode === 'number' ? (
            <Input
              id={label}
              type="number"
              value={typeof value === 'number' ? value : 0}
              onChange={handleNumberChange}
              min={min}
              max={max}
              disabled={disabled}
              className={error ? 'border-destructive' : ''}
            />
          ) : (
            <Select value={value as string} onValueChange={handleSpecialChange} disabled={disabled}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {specialValues.map(sv => (
                  <SelectItem key={sv} value={sv}>
                    {sv}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
