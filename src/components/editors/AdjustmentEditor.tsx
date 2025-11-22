import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface AdjustmentEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

export function AdjustmentEditor({
  value,
  onChange,
  label,
  disabled = false,
  error,
  placeholder = '10 or 10%',
}: AdjustmentEditorProps) {
  const isPercentage = value.endsWith('%');
  const numericValue = isPercentage ? value.slice(0, -1) : value;

  const togglePercentage = () => {
    if (isPercentage) {
      onChange(numericValue);
    } else {
      onChange(`${numericValue}%`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (isPercentage) {
      onChange(`${newValue}%`);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label} className="text-sm font-medium">
        {label}
      </Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            id={label}
            type="text"
            value={numericValue}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            className={error ? 'border-destructive' : ''}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={togglePercentage}
          disabled={disabled}
          className="w-16"
        >
          {isPercentage ? '%' : 'px'}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
