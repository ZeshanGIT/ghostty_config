/**
 * Change Summary Component
 *
 * Show what will change when saving
 */

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, FileEdit, FilePlus, FileX } from 'lucide-react';
import { useConfigStore } from '@/stores/configStore';
import { useState } from 'react';

export function ChangeSummary() {
  const { getChangeSummary } = useConfigStore();
  const changeSummary = getChangeSummary();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasChanges = changeSummary.total > 0;

  if (!hasChanges) {
    return (
      <Card className="p-4">
        <div className="text-sm text-muted-foreground text-center">No changes to save</div>
      </Card>
    );
  }

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
            <h3 className="font-semibold">Changes</h3>
            <Badge variant="secondary">{changeSummary.total}</Badge>
          </div>
        </CollapsibleTrigger>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {changeSummary.modified.length}
            </div>
            <div className="text-xs text-muted-foreground">Modified</div>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded-md">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {changeSummary.added.length}
            </div>
            <div className="text-xs text-muted-foreground">Added</div>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded-md">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {changeSummary.removed.length}
            </div>
            <div className="text-xs text-muted-foreground">Removed</div>
          </div>
        </div>

        <CollapsibleContent>
          <div className="mt-4 space-y-3">
            {/* Modified Properties */}
            {changeSummary.modified.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileEdit className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-medium">Modified</h4>
                </div>
                <div className="space-y-1 ml-6">
                  {changeSummary.modified.map(key => (
                    <div key={key} className="text-sm font-mono text-muted-foreground">
                      {key}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Added Properties */}
            {changeSummary.added.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FilePlus className="h-4 w-4 text-green-600" />
                  <h4 className="text-sm font-medium">Added</h4>
                </div>
                <div className="space-y-1 ml-6">
                  {changeSummary.added.map(key => (
                    <div key={key} className="text-sm font-mono text-muted-foreground">
                      {key}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Removed Properties */}
            {changeSummary.removed.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileX className="h-4 w-4 text-red-600" />
                  <h4 className="text-sm font-medium">Removed</h4>
                </div>
                <div className="space-y-1 ml-6">
                  {changeSummary.removed.map(key => (
                    <div key={key} className="text-sm font-mono text-muted-foreground">
                      {key}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
