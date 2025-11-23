import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface KeybindingEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

export function KeybindingEditor({
  value,
  onChange,
  label,
  disabled = false,
  error,
  placeholder = 'ctrl+shift+t>new_tab',
}: KeybindingEditorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isRecording) return;

    e.preventDefault();
    e.stopPropagation();

    const keys: string[] = [];
    if (e.ctrlKey) keys.push('ctrl');
    if (e.shiftKey) keys.push('shift');
    if (e.altKey) keys.push('alt');
    if (e.metaKey) keys.push('super');

    // Add the main key if it's not a modifier
    if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      keys.push(e.key.toLowerCase());
    }

    setRecordedKeys(keys);
  };

  const handleStopRecording = () => {
    if (recordedKeys.length > 0) {
      const keyCombo = recordedKeys.join('+');
      // Parse the existing value to get the action part
      const safeValue = value || '';
      const parts = safeValue.split('>');
      const action = parts.length > 1 ? parts[1] : '';
      onChange(action ? `${keyCombo}>${action}` : keyCombo);
    }
    setIsRecording(false);
    setRecordedKeys([]);
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
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={error ? 'border-destructive' : ''}
          />
        </div>
        <Button
          type="button"
          variant={isRecording ? 'destructive' : 'outline'}
          onClick={() => {
            if (isRecording) {
              handleStopRecording();
            } else {
              setIsRecording(true);
              setRecordedKeys([]);
            }
          }}
          disabled={disabled}
        >
          {isRecording ? 'Stop' : 'Record'}
        </Button>
      </div>
      {isRecording && recordedKeys.length > 0 && (
        <p className="text-xs text-muted-foreground">Recording: {recordedKeys.join('+')}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
