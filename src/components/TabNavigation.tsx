import { Tab } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface TabNavigationProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  modifiedCounts?: Map<string, number>;
}

export function TabNavigation({
  tabs,
  activeTabId,
  onTabChange,
  modifiedCounts = new Map(),
}: TabNavigationProps) {
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;

    // Get the icon component from lucide-react
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (LucideIcons as any)[iconName] as React.ComponentType<{
      className?: string;
    }>;
    if (!IconComponent) return null;

    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <nav className="space-y-1">
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        const modifiedCount = modifiedCounts.get(tab.id) || 0;
        const Icon = tab.icon ? getIcon(tab.icon) : null;

        return (
          <Button
            key={tab.id}
            variant={isActive ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3',
              isActive && 'bg-primary text-primary-foreground',
              !isActive && 'hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={() => onTabChange(tab.id)}
          >
            {Icon}
            <span className="flex-1 text-left">{tab.label}</span>
            {modifiedCount > 0 && (
              <Badge variant={isActive ? 'secondary' : 'outline'} className="ml-auto">
                {modifiedCount}
              </Badge>
            )}
          </Button>
        );
      })}
    </nav>
  );
}
