/**
 * Category Sidebar Component
 *
 * Displays categories and sections for navigation
 */

import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { GHOSTTY_SCHEMA } from '@/data/ghostty-schema.generated';
import { useConfigStore } from '@/stores/configStore';
import { useState } from 'react';

export function CategorySidebar() {
  const { activeCategory, activeSection, setActiveCategory, setActiveSection, modifiedProperties } =
    useConfigStore();

  // Track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set([activeCategory || 'appearance'])
  );

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Auto-select first section if category has sections
    const category = GHOSTTY_SCHEMA.categories.find(c => c.id === categoryId);
    if (category?.sections && category.sections.length > 0) {
      setActiveSection(category.sections[0].id);
    }
  };

  const handleSectionClick = (categoryId: string, sectionId: string) => {
    setActiveCategory(categoryId);
    setActiveSection(sectionId);
  };

  // Count modified properties per category/section
  const getModifiedCount = (categoryId: string, sectionId?: string) => {
    if (!modifiedProperties) return 0;

    let count = 0;
    for (const propKey of modifiedProperties) {
      // Find property in schema
      const category = GHOSTTY_SCHEMA.categories.find(c => c.id === categoryId);
      if (!category) continue;

      for (const section of category.sections) {
        if (sectionId && section.id !== sectionId) continue;

        const hasProperty = section.properties.some(p => p.key === propKey);
        if (hasProperty) {
          count++;
        }
      }
    }
    return count;
  };

  return (
    <div className="w-64 border-r bg-background">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Configuration</h2>
      </div>

      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="p-2">
          {GHOSTTY_SCHEMA.categories.map(category => {
            const isExpanded = expandedCategories.has(category.id);
            const isActive = activeCategory === category.id;
            const modifiedCount = getModifiedCount(category.id);

            return (
              <Collapsible
                key={category.id}
                open={isExpanded}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <div className="mb-1">
                  <CollapsibleTrigger
                    className={cn(
                      'flex items-center justify-between w-full px-3 py-2 rounded-md',
                      'hover:bg-accent hover:text-accent-foreground transition-colors',
                      isActive && 'bg-accent text-accent-foreground'
                    )}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-medium">{category.displayName}</span>
                    </div>
                    {modifiedCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {modifiedCount}
                      </Badge>
                    )}
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="ml-6 mt-1 space-y-1">
                      {category.sections.map(section => {
                        const isSectionActive =
                          activeCategory === category.id && activeSection === section.id;
                        const sectionModifiedCount = getModifiedCount(category.id, section.id);

                        return (
                          <button
                            key={section.id}
                            onClick={() => handleSectionClick(category.id, section.id)}
                            className={cn(
                              'flex items-center justify-between w-full px-3 py-1.5 rounded-md text-sm',
                              'hover:bg-accent/50 hover:text-accent-foreground transition-colors',
                              isSectionActive && 'bg-accent text-accent-foreground font-medium'
                            )}
                          >
                            <span>{section.displayName}</span>
                            {sectionModifiedCount > 0 && (
                              <Badge variant="outline" className="ml-auto text-xs">
                                {sectionModifiedCount}
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
