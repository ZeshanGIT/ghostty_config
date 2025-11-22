/**
 * Ghostty Config Editor - Main App Component
 *
 * A modern GUI for editing Ghostty terminal configuration files
 */

import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadSchema, getSchemaStats } from '@/lib/schemaLoader';

function App() {
  const schema = loadSchema();
  const stats = getSchemaStats(schema);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Terminal className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Ghostty Config Editor</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Schema v{schema.version} | {stats.properties} properties
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-2xl">
          <h2 className="text-3xl font-bold">Implementation in Progress</h2>
          <p className="text-muted-foreground text-lg">
            Phase 1: Schema Integration & Type System - Complete ✅
          </p>
          <p className="text-muted-foreground">
            The schema has been successfully loaded with {stats.properties} configuration properties
            across {stats.tabs} tabs and {stats.sections} sections.
          </p>
          <div className="pt-4">
            <Button onClick={() => console.log('Schema:', schema)}>Log Schema to Console</Button>
          </div>

          <div className="mt-8 p-6 border rounded-lg bg-muted/30 text-left">
            <h3 className="font-semibold mb-3">Schema Statistics</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Tabs:</span>
                <span className="ml-2 font-mono">{stats.tabs}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Sections:</span>
                <span className="ml-2 font-mono">{stats.sections}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Properties:</span>
                <span className="ml-2 font-mono">{stats.properties}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Comments:</span>
                <span className="ml-2 font-mono">{stats.comments}</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Value Type Distribution:</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {Object.entries(stats.valueTypes)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="text-muted-foreground">{type}:</span>
                      <span className="font-mono">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            Next: Phase 3 - State Management & Tauri Integration
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
