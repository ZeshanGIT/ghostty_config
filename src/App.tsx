/**
 * Ghostty Config Editor - Main App Component
 *
 * A modern GUI for editing Ghostty terminal configuration files
 */

import { useEffect } from 'react';
import { Terminal, FolderOpen, Save, AlertCircle } from 'lucide-react';
import { useConfigStore } from '@/stores/configStore';
import { TabNavigation } from '@/components/TabNavigation';
import { SectionSidebar } from '@/components/SectionSidebar';
import { SectionEditor } from '@/components/SectionEditor';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

function App() {
  const {
    schema,
    schemaLoaded,
    loadSchema,
    openConfigFile,
    saveConfig,
    filePath,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    activeTab,
    activeSection,
  } = useConfigStore();

  // Load schema on mount
  useEffect(() => {
    if (!schemaLoaded) {
      loadSchema();
    }
  }, [schemaLoaded, loadSchema]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'o') {
        e.preventDefault();
        openConfigFile();
      } else if (modifier && e.key === 's') {
        e.preventDefault();
        if (filePath && hasUnsavedChanges()) {
          saveConfig();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openConfigFile, saveConfig, filePath, hasUnsavedChanges]);

  if (!schemaLoaded || !schema) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Terminal className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading schema...</p>
        </div>
      </div>
    );
  }

  const currentTab = schema.tabs.find(tab => tab.id === activeTab);
  const currentSection = currentTab?.sections.find(section => section.id === activeSection);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Terminal className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold">Ghostty Config Editor</h1>
              {filePath && (
                <p className="text-xs text-muted-foreground truncate max-w-md">
                  {filePath}
                  {hasUnsavedChanges() && (
                    <span className="ml-2 text-orange-600 dark:text-orange-400">
                      (unsaved changes)
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openConfigFile} disabled={isLoading}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Open Config
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={saveConfig}
              disabled={!filePath || !hasUnsavedChanges() || isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="px-6 pt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Tab Navigation + Section List */}
        <aside className="w-64 border-r bg-card flex flex-col">
          <TabNavigation
            tabs={schema.tabs}
            activeTabId={activeTab}
            onTabChange={useConfigStore.getState().setActiveTab}
          />
          <Separator />
          <div className="flex-1 overflow-y-auto">
            <SectionSidebar
              sections={currentTab?.sections || []}
              activeSectionId={activeSection}
              onSectionChange={useConfigStore.getState().setActiveSection}
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {filePath ? (
            <div className="p-6">
              {/* Breadcrumb */}
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{currentTab?.label}</span>
                <span>/</span>
                <span className="text-foreground font-medium">{currentSection?.label}</span>
              </div>

              {/* Section Editor */}
              {currentSection && (
                <SectionEditor
                  section={currentSection}
                  values={useConfigStore.getState().config}
                  onChange={useConfigStore.getState().updateProperty}
                />
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-6 max-w-lg">
                <div className="p-6 bg-muted/30 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">No Config File Loaded</h2>
                  <p className="text-muted-foreground">
                    Open a Ghostty configuration file to start editing, or load the default config
                    from your system.
                  </p>
                </div>
                <div className="flex flex-col gap-3 items-center">
                  <Button onClick={openConfigFile} size="lg">
                    <FolderOpen className="h-5 w-5 mr-2" />
                    Open Config File
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Keyboard shortcut:{' '}
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">
                      {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'} + O
                    </kbd>
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Status Bar */}
      <footer className="border-t bg-card px-6 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>
            {schema.version && <span>Schema v{schema.version}</span>}
            {filePath && (
              <>
                <span className="mx-2">•</span>
                <span>
                  {schema.tabs.reduce((acc, tab) => acc + tab.sections.length, 0)} sections
                </span>
                <span className="mx-2">•</span>
                <span>
                  {schema.tabs.reduce(
                    (acc, tab) =>
                      acc +
                      tab.sections.reduce(
                        (sum, sec) => sum + sec.keys.filter(item => item.type === 'config').length,
                        0
                      ),
                    0
                  )}{' '}
                  properties
                </span>
              </>
            )}
          </div>
          <div>
            {isLoading && <span>Loading...</span>}
            {isSaving && <span>Saving...</span>}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
