import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  id: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  onClose?: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  onClose,
}) => {
  const typeStyles = {
    success: {
      bg: 'bg-surface border-success/40',
      icon: 'check_circle',
      iconColor: 'text-success',
    },
    warning: {
      bg: 'bg-surface border-warning/40',
      icon: 'warning',
      iconColor: 'text-warning',
    },
    error: {
      bg: 'bg-surface border-error/40',
      icon: 'error',
      iconColor: 'text-error',
    },
    info: {
      bg: 'bg-surface border-accent/40',
      icon: 'info',
      iconColor: 'text-accent',
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border p-4 shadow-dropdown animate-in slide-in-from-top-2 w-80',
        style.bg
      )}
    >
      <span className={cn('material-symbols-outlined text-[20px] shrink-0 mt-0.5', style.iconColor)}>
        {style.icon}
      </span>
      <div className="flex-1 space-y-0.5">
        {title && <h4 className="text-sm font-semibold text-primary">{title}</h4>}
        <p className="text-xs text-secondary-text">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={() => onClose(id)}
          className="rounded-sm p-0.5 text-secondary-text hover:text-main-text transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
    </div>
  );
};
