/**
 * File Loader Component
 *
 * Load configuration files from disk
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, FolderOpen, Loader2 } from 'lucide-react';
import { useConfigStore } from '@/stores/configStore';
import { open } from '@tauri-apps/plugin-dialog';

export function FileLoader() {
  const { filePath, isLoading, error, loadConfigFile, loadDefaultConfig, clearError } =
    useConfigStore();

  const handleOpenFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Ghostty Config',
            extensions: ['properties', 'conf', 'config'],
          },
        ],
      });

      if (selected && typeof selected === 'string') {
        await loadConfigFile(selected);
      }
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  };

  const handleLoadDefault = async () => {
    try {
      await loadDefaultConfig();
    } catch (err) {
      console.error('Failed to load default config:', err);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Configuration File</h3>
        </div>

        {/* Current file path */}
        {filePath ? (
          <div className="text-sm">
            <span className="text-muted-foreground">Loaded: </span>
            <span className="font-mono">{filePath}</span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No file loaded</div>
        )}

        {/* Error display */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={clearError} className="mt-2">
              Dismiss
            </Button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleOpenFile}
            disabled={isLoading}
            className="flex-1 flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FolderOpen className="h-4 w-4" />
            )}
            Open File
          </Button>
          <Button
            variant="outline"
            onClick={handleLoadDefault}
            disabled={isLoading}
            className="flex-1 flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Load Default
          </Button>
        </div>
      </div>
    </Card>
  );
}
