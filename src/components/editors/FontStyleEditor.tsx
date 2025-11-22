import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface FontStyleEditorProps {
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  label: string;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

export function FontStyleEditor({
  value,
  onChange,
  label,
  disabled = false,
  error,
  placeholder = 'Bold, Italic, etc.',
}: FontStyleEditorProps) {
  const isDisabled = value === false;
  const styleValue = typeof value === 'string' ? value : '';

  const handleToggle = (checked: boolean) => {
    onChange(checked ? '' : false);
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={label} className="text-sm font-medium">
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <Label htmlFor={`${label}-toggle`} className="text-xs text-muted-foreground">
            Enabled
          </Label>
          <Switch
            id={`${label}-toggle`}
            checked={!isDisabled}
            onCheckedChange={handleToggle}
            disabled={disabled}
          />
        </div>
      </div>
      {!isDisabled && (
        <Input
          id={label}
          type="text"
          value={styleValue}
          onChange={handleStyleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={error ? 'border-destructive' : ''}
        />
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
