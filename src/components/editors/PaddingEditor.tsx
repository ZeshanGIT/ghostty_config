import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaddingEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  error?: string;
}

export function PaddingEditor({
  value,
  onChange,
  label,
  disabled = false,
  error,
}: PaddingEditorProps) {
  // Parse padding value - can be "x" or "x,y"
  const parts = value.split(',').map(p => p.trim());
  const [horizontal, vertical] = parts.length === 2 ? parts : [parts[0] || '0', parts[0] || '0'];

  const handleHorizontalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHorizontal = e.target.value;
    onChange(vertical === newHorizontal ? newHorizontal : `${newHorizontal},${vertical}`);
  };

  const handleVerticalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVertical = e.target.value;
    onChange(horizontal === newVertical ? horizontal : `${horizontal},${newVertical}`);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor={`${label}-h`} className="text-xs text-muted-foreground">
            Horizontal
          </Label>
          <Input
            id={`${label}-h`}
            type="text"
            value={horizontal}
            onChange={handleHorizontalChange}
            disabled={disabled}
            placeholder="0"
            className={error ? 'border-destructive' : ''}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${label}-v`} className="text-xs text-muted-foreground">
            Vertical
          </Label>
          <Input
            id={`${label}-v`}
            type="text"
            value={vertical}
            onChange={handleVerticalChange}
            disabled={disabled}
            placeholder="0"
            className={error ? 'border-destructive' : ''}
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
