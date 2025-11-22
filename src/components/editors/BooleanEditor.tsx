import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface BooleanEditorProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
  error?: string;
}

export function BooleanEditor({
  value,
  onChange,
  label,
  disabled = false,
  error,
}: BooleanEditorProps) {
  return (
    <div className="flex items-center justify-between space-x-4">
      <Label htmlFor={label} className="text-sm font-medium cursor-pointer">
        {label}
      </Label>
      <div className="flex flex-col items-end gap-1">
        <Switch id={label} checked={value} onCheckedChange={onChange} disabled={disabled} />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
