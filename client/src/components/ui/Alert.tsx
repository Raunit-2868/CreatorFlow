import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className,
  ...props
}) => {
  const styles = {
    info: 'bg-accent-light/50 border-accent/40 text-primary',
    success: 'bg-success-light border-success/40 text-success',
    warning: 'bg-warning-light border-warning/40 text-warning',
    error: 'bg-error-light border-error/40 text-error',
  };

  const icons = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
  };

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-md border p-4 text-sm',
        styles[variant],
        className
      )}
      {...props}
    >
      <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
        {icons[variant]}
      </span>
      <div className="space-y-1">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
};
