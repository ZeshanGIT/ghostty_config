import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CommandEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

export function CommandEditor({
  value,
  onChange,
  label,
  disabled = false,
  error,
  placeholder = 'command arg1 arg2',
}: CommandEditorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={label} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={label}
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
