import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FolderOpen } from 'lucide-react';

interface FilepathEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  directory?: boolean;
}

export function FilepathEditor({
  value,
  onChange,
  label,
  disabled = false,
  error,
  placeholder = '/path/to/file',
  directory = false,
}: FilepathEditorProps) {
  const handleBrowse = async () => {
    // TODO: Integrate with Tauri file dialog in Phase 5
    console.log('Browse for file/directory');
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
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className={error ? 'border-destructive' : ''}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleBrowse}
          disabled={disabled}
          aria-label={directory ? 'Browse for directory' : 'Browse for file'}
        >
          <FolderOpen className="h-4 w-4" />
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
