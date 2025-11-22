import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface RepeatableTextEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

export function RepeatableTextEditor({
  value,
  onChange,
  label,
  disabled = false,
  error,
  placeholder = 'Enter value',
}: RepeatableTextEditorProps) {
  const handleAdd = () => {
    onChange([...value, '']);
  };

  const handleRemove = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue.length > 0 ? newValue : ['']);
  };

  const handleChange = (index: number, newVal: string) => {
    const newValue = [...value];
    newValue[index] = newVal;
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                value={item}
                onChange={e => handleChange(index, e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                className={error ? 'border-destructive' : ''}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleRemove(index)}
              disabled={disabled || value.length === 1}
              aria-label="Remove item"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
