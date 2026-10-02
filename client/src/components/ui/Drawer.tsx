import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  maxWidth?: 'sm' | 'md' | 'lg';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'right',
  maxWidth = 'md',
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2B2B2B]/40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div
        className={cn(
          'fixed inset-y-0 flex max-w-full',
          position === 'right' ? 'right-0 pl-10' : 'left-0 pr-10'
        )}
      >
        <div
          className={cn(
            'w-screen border-border bg-surface p-6 shadow-dropdown transition-all animate-in',
            position === 'right' ? 'slide-in-from-right border-l' : 'slide-in-from-left border-r',
            maxWidthClasses[maxWidth]
          )}
        >
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div>
              {title && (
                <h3 className="font-headline text-lg font-bold text-primary">{title}</h3>
              )}
              {description && (
                <p className="text-sm text-secondary-text">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-sm p-1 text-secondary-text hover:text-main-text hover:bg-surface-hover transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div className="py-4 overflow-y-auto max-h-[calc(100vh-100px)]">{children}</div>
        </div>
      </div>
    </div>
  );
};
