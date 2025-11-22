import { Section } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SectionSidebarProps {
  sections: Section[];
  activeSectionId: string;
  onSectionChange: (sectionId: string) => void;
  modifiedCounts?: Map<string, number>;
}

export function SectionSidebar({
  sections,
  activeSectionId,
  onSectionChange,
  modifiedCounts = new Map(),
}: SectionSidebarProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 pr-4">
        {sections.map(section => {
          const isActive = section.id === activeSectionId;
          const modifiedCount = modifiedCounts.get(section.id) || 0;

          return (
            <Button
              key={section.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start text-sm',
                isActive && 'bg-secondary text-secondary-foreground',
                !isActive && 'hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={() => onSectionChange(section.id)}
            >
              <span className="flex-1 text-left truncate">{section.label}</span>
              {modifiedCount > 0 && (
                <Badge variant={isActive ? 'default' : 'outline'} className="ml-2">
                  {modifiedCount}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
