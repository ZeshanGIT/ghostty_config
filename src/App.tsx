/**
 * Ghostty Config Editor - Main App Component
 *
 * A modern GUI for editing Ghostty terminal configuration files
 */

import { useState, useEffect } from 'react';
import { Terminal, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConfigStore } from '@/stores/configStore';
import { GHOSTTY_SCHEMA } from '@/data/ghostty-schema.generated';

// Components
import { CategorySidebar } from '@/components/CategorySidebar';
import { FileLoader } from '@/components/FileLoader';
import { PropertyEditor } from '@/components/PropertyEditor';
import { WarningsPanel } from '@/components/WarningsPanel';
import { ChangeSummary } from '@/components/ChangeSummary';
import { SaveDialog } from '@/components/SaveDialog';

function App() {
  const { activeCategory, activeSection, getChangeSummary } = useConfigStore();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const changeSummary = getChangeSummary();
  const hasChanges = changeSummary.total > 0;

  // Get properties for the active section
  const activeProperties = (() => {
    if (!activeCategory || !activeSection) return [];

    const category = GHOSTTY_SCHEMA.categories.find(c => c.id === activeCategory);
    if (!category) return [];

    const section = category.sections.find(s => s.id === activeSection);
    if (!section) return [];

    return section.properties;
  })();

  // Auto-select first category and section on mount
  useEffect(() => {
    if (!activeCategory && GHOSTTY_SCHEMA.categories.length > 0) {
      const firstCategory = GHOSTTY_SCHEMA.categories[0];
      if (firstCategory.sections.length > 0) {
        useConfigStore.getState().setActiveCategory(firstCategory.id);
        useConfigStore.getState().setActiveSection(firstCategory.sections[0].id);
      }
    }
  }, [activeCategory]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Terminal className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Ghostty Config Editor</h1>
          </div>
          <Button
            onClick={() => setSaveDialogOpen(true)}
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
            {hasChanges && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-background/20 rounded">
                {changeSummary.total}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <CategorySidebar />

        <Separator orientation="vertical" />

        {/* Center - Property Editors */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* File Loader Section */}
          <div className="p-6 border-b bg-muted/30">
            <FileLoader />
          </div>

          {/* Properties Section */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {activeProperties.length > 0 ? (
                <div className="space-y-4 max-w-3xl">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">
                      {
                        GHOSTTY_SCHEMA.categories
                          .find(c => c.id === activeCategory)
                          ?.sections.find(s => s.id === activeSection)?.displayName
                      }
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Configure{' '}
                      {GHOSTTY_SCHEMA.categories
                        .find(c => c.id === activeCategory)
                        ?.sections.find(s => s.id === activeSection)
                        ?.displayName.toLowerCase()}{' '}
                      settings
                    </p>
                  </div>

                  {activeProperties.map(property => (
                    <PropertyEditor key={property.key} property={property} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg">No properties available</p>
                    <p className="text-sm mt-2">Select a category and section from the sidebar</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <Separator orientation="vertical" />

        {/* Right Sidebar - Summary & Warnings */}
        <div className="w-80 flex flex-col overflow-hidden bg-muted/20">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Summary</h3>
                <ChangeSummary />
              </div>

              <Separator />

              <WarningsPanel />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Save Dialog */}
      <SaveDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen} />
    </div>
  );
}

export default App;
