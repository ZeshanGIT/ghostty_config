import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

const Collapsible = ({ open, onOpenChange, children, className }: CollapsibleProps) => {
  const [isOpen, setIsOpen] = React.useState(open ?? false);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleToggle = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <div className={cn('', className)} data-state={isOpen ? 'open' : 'closed'}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === CollapsibleTrigger) {
            return React.cloneElement(child as React.ReactElement<CollapsibleTriggerProps>, {
              onClick: handleToggle,
            });
          }
          if (child.type === CollapsibleContent) {
            return React.cloneElement(child as React.ReactElement<CollapsibleContentProps>, {
              isOpen,
            });
          }
        }
        return child;
      })}
    </div>
  );
};
Collapsible.displayName = 'Collapsible';

type CollapsibleTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ className, ...props }, ref) => (
    <button ref={ref} type="button" className={cn('', className)} {...props} />
  )
);
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, isOpen, ...props }, ref) => {
    if (!isOpen) return null;

    return <div ref={ref} className={cn('overflow-hidden', className)} {...props} />;
  }
);
CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
