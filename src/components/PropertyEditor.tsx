import { ConfigProperty } from '@/types/schema';
import { BooleanEditor } from './editors/BooleanEditor';
import { EnumEditor } from './editors/EnumEditor';
import { NumberEditor } from './editors/NumberEditor';
import { TextEditor } from './editors/TextEditor';
import { ColorEditor } from './editors/ColorEditor';
import { KeybindingEditor } from './editors/KeybindingEditor';
import { FilepathEditor } from './editors/FilepathEditor';
import { RepeatableTextEditor } from './editors/RepeatableTextEditor';
import { AdjustmentEditor } from './editors/AdjustmentEditor';
import { OpacityEditor } from './editors/OpacityEditor';
import { PaddingEditor } from './editors/PaddingEditor';
import { CommandEditor } from './editors/CommandEditor';
import { FontStyleEditor } from './editors/FontStyleEditor';
import { SpecialNumberEditor } from './editors/SpecialNumberEditor';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';

interface PropertyEditorProps {
  property: ConfigProperty;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
  isModified?: boolean;
}

export function PropertyEditor({
  property,
  value,
  onChange,
  error,
  isModified = false,
}: PropertyEditorProps) {
  const renderEditor = () => {
    switch (property.valueType) {
      case 'boolean': {
        const boolValue = typeof value === 'string' ? value === 'true' : false;
        return (
          <BooleanEditor
            label={property.label}
            value={boolValue}
            onChange={v => onChange(v ? 'true' : 'false')}
            error={error}
          />
        );
      }

      case 'enum':
        return (
          <EnumEditor
            label={property.label}
            value={value as string}
            onChange={onChange as (value: string) => void}
            options={property.options.values.map(v => v.value)}
            error={error}
            placeholder={property.options.values[0]?.description}
          />
        );

      case 'number': {
        const numValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
        return (
          <NumberEditor
            label={property.label}
            value={numValue}
            onChange={v => onChange(String(v))}
            min={property.validation?.min}
            max={property.validation?.max}
            step={property.options?.step || 1}
            error={error}
          />
        );
      }

      case 'text':
        return (
          <TextEditor
            label={property.label}
            value={value as string}
            onChange={onChange as (value: string) => void}
            placeholder={property.options?.placeholder}
            error={error}
          />
        );

      case 'font-family':
        return (
          <TextEditor
            label={property.label}
            value={value as string}
            onChange={onChange as (value: string) => void}
            placeholder={property.options?.allowSystemDefault ? 'System default' : ''}
            error={error}
          />
        );

      case 'color':
        return (
          <ColorEditor
            label={property.label}
            value={value as string}
            onChange={onChange as (value: string) => void}
            placeholder={property.options?.format === 'hex' ? '#000000' : 'black'}
            error={error}
          />
        );

      case 'keybinding':
        return (
          <KeybindingEditor
            label={property.label}
            value={value as string}
            onChange={onChange as (value: string) => void}
            error={error}
          />
        );

      case 'filepath':
        return (
          <FilepathEditor
            label={property.label}
            value={value as string}
            onChange={onChange as (value: string) => void}
            directory={property.options.fileType === 'directory'}
            error={error}
          />
        );

      case 'repeatable-text':
        return (
          <RepeatableTextEditor
            label={property.label}
            value={value as string[]}
            onChange={onChange as (value: string[]) => void}
            placeholder={property.options?.placeholder}
            error={error}
          />
        );

      case 'adjustment':
        return (
          <AdjustmentEditor
            label={property.label}
            value={value as string}
            onChange={onChange as (value: string) => void}
            error={error}
          />
        );

      case 'opacity': {
        const opacityValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
        return (
          <OpacityEditor
            label={property.label}
            value={opacityValue}
            onChange={v => onChange(String(v))}
            error={error}
          />
        );
      }

      case 'padding':
        return (
          <PaddingEditor
            label={property.label}
            value={value as string}
            onChange={onChange as (value: string) => void}
            error={error}
          />
        );

      case 'command':
        return (
          <CommandEditor
            label={property.label}
            value={value as string}
            onChange={onChange as (value: string) => void}
            error={error}
          />
        );

      case 'font-style':
        return (
          <FontStyleEditor
            label={property.label}
            value={value as string | boolean}
            onChange={onChange as (value: string | boolean) => void}
            error={error}
          />
        );

      case 'special-number': {
        const specialValue =
          typeof value === 'string' && isNaN(parseFloat(value))
            ? value
            : parseFloat(value as string);
        return (
          <SpecialNumberEditor
            label={property.label}
            value={specialValue}
            onChange={v => onChange(String(v))}
            min={property.validation?.min}
            max={property.validation?.max}
            specialValues={property.options?.specialFormats}
            error={error}
          />
        );
      }

      default: {
        // Fallback to text editor for unknown types
        const exhaustiveCheck: never = property;
        console.warn('Unhandled property type:', exhaustiveCheck);
        return null;
      }
    }
  };

  return (
    <div className="space-y-1 py-3 px-4 rounded-lg border border-border hover:border-ring transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">{property.key}</span>
          {isModified && (
            <Badge variant="outline" className="text-xs">
              Modified
            </Badge>
          )}
          {property.required && (
            <Badge variant="destructive" className="text-xs">
              Required
            </Badge>
          )}
          {property.deprecated && (
            <Badge variant="secondary" className="text-xs">
              Deprecated
            </Badge>
          )}
        </div>
        {property.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm">{property.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {renderEditor()}
    </div>
  );
}
