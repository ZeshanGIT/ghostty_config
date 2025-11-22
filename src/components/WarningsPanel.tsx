/**
 * Warnings Panel Component
 *
 * Display parser warnings and validation errors
 */

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { useConfigStore } from '@/stores/configStore';
import { useState } from 'react';

export function WarningsPanel() {
  const { warnings } = useConfigStore();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!warnings || warnings.length === 0) {
    return null;
  }

  // Group warnings by type
  const unknownProperties = warnings.filter(w => w.type === 'unknown-property');
  const validationErrors = warnings.filter(w => w.type === 'validation-error');
  const parseErrors = warnings.filter(w => w.type === 'parse-error');

  return (
    <Card className="p-4">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold">Warnings</h3>
            <Badge variant="destructive">{warnings.length}</Badge>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ScrollArea className="h-[300px] mt-4">
            <div className="space-y-3">
              {/* Unknown Properties */}
              {unknownProperties.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Unknown Properties</h4>
                  {unknownProperties.map((warning, index) => (
                    <Alert key={index} variant="default" className="mb-2">
                      <AlertTitle className="text-sm">
                        Line {warning.lineNumber}: {warning.key}
                      </AlertTitle>
                      <AlertDescription className="text-xs">{warning.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Validation Errors</h4>
                  {validationErrors.map((warning, index) => (
                    <Alert key={index} variant="destructive" className="mb-2">
                      <AlertTitle className="text-sm">
                        Line {warning.lineNumber}: {warning.key}
                      </AlertTitle>
                      <AlertDescription className="text-xs">{warning.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Parse Errors */}
              {parseErrors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Parse Errors</h4>
                  {parseErrors.map((warning, index) => (
                    <Alert key={index} variant="destructive" className="mb-2">
                      <AlertTitle className="text-sm">
                        Line {warning.lineNumber}
                        {warning.key && `: ${warning.key}`}
                      </AlertTitle>
                      <AlertDescription className="text-xs">{warning.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
