import { Section } from '@/types/schema';
import { PropertyEditor } from './PropertyEditor';
import { isConfigProperty, isCommentBlock } from '@/types/schema';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface SectionEditorProps {
  section: Section;
  values: Map<string, string | string[]>;
  onChange: (key: string, value: string | string[]) => void;
  modifiedKeys?: Set<string>;
  errors?: Map<string, string>;
}

export function SectionEditor({
  section,
  values,
  onChange,
  modifiedKeys = new Set(),
  errors = new Map(),
}: SectionEditorProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{section.label}</h2>
        {section.description && (
          <p className="text-sm text-muted-foreground">{section.description}</p>
        )}
      </div>

      {/* Section Items */}
      <div className="space-y-4">
        {section.keys.map((item, index) => {
          if (isCommentBlock(item)) {
            // Render comment block as an info alert
            return (
              <Alert key={`comment-${index}`} className="bg-muted/50">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm whitespace-pre-wrap">
                  {item.content}
                </AlertDescription>
              </Alert>
            );
          }

          if (isConfigProperty(item)) {
            // Render config property with PropertyEditor
            const storedValue = values.get(item.key);
            // Convert default value to string/string[]
            let defaultValue: string | string[] = '';
            if (item.defaultValue !== null && item.defaultValue !== undefined) {
              if (Array.isArray(item.defaultValue)) {
                defaultValue = item.defaultValue.map(String);
              } else if (typeof item.defaultValue === 'object') {
                defaultValue = JSON.stringify(item.defaultValue);
              } else {
                defaultValue = String(item.defaultValue);
              }
            }
            const value = storedValue !== undefined ? storedValue : defaultValue;
            const isModified = modifiedKeys.has(item.key);
            const error = errors.get(item.key);

            return (
              <PropertyEditor
                key={item.key}
                property={item}
                value={value}
                onChange={newValue => onChange(item.key, newValue)}
                isModified={isModified}
                error={error}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
