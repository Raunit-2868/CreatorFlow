import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
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
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2B2B2B]/40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full rounded-lg border border-border bg-surface p-6 shadow-dropdown animate-in zoom-in-95 z-10',
          maxWidthClasses[maxWidth]
        )}
      >
        <div className="flex items-start justify-between pb-4">
          <div className="space-y-1">
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

        <div className="py-2">{children}</div>

        {footer && <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border/60">{footer}</div>}
      </div>
    </div>
  );
};
