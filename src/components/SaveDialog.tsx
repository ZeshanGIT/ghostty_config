/**
 * Save Dialog Component
 *
 * Confirm and execute save operation
 */

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useConfigStore } from '@/stores/configStore';
import { FileEdit, FilePlus, FileX, Loader2, Save } from 'lucide-react';

export interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveDialog({ open, onOpenChange }: SaveDialogProps) {
  const { getChangeSummary, saveConfig, isSaving } = useConfigStore();
  const changeSummary = getChangeSummary();

  const handleSave = async () => {
    await saveConfig();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Configuration</DialogTitle>
          <DialogDescription>
            Review the changes before saving to the configuration file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Change summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {changeSummary.modified.length}
              </div>
              <div className="text-xs text-muted-foreground">Modified</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-md">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {changeSummary.added.length}
              </div>
              <div className="text-xs text-muted-foreground">Added</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-md">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {changeSummary.removed.length}
              </div>
              <div className="text-xs text-muted-foreground">Removed</div>
            </div>
          </div>

          {/* Detailed changes */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto p-3 bg-muted/30 rounded-md">
            {/* Modified */}
            {changeSummary.modified.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileEdit className="h-4 w-4 text-blue-600" />
                  <Badge variant="secondary">{changeSummary.modified.length} modified</Badge>
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

            {/* Added */}
            {changeSummary.added.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FilePlus className="h-4 w-4 text-green-600" />
                  <Badge variant="secondary">{changeSummary.added.length} added</Badge>
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

            {/* Removed */}
            {changeSummary.removed.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileX className="h-4 w-4 text-red-600" />
                  <Badge variant="secondary">{changeSummary.removed.length} removed</Badge>
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

          {/* Backup notice */}
          <div className="text-sm text-muted-foreground italic">
            A backup (.bak) will be created before saving.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
