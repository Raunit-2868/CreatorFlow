import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    return (
      <div className="flex items-start space-x-2.5">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            className={cn(
              'h-4 w-4 appearance-none rounded-sm border border-border bg-surface checked:bg-primary checked:border-primary transition-colors cursor-pointer',
              'focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-1',
              className
            )}
            ref={ref}
            {...props}
          />
          <span className="material-symbols-outlined pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[14px] opacity-0 check-indicator">
            check
          </span>
        </div>
        {(label || description) && (
          <div className="grid gap-0.5 leading-none">
            {label && (
              <label
                htmlFor={id}
                className="text-sm font-medium text-main-text cursor-pointer select-none"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-secondary-text select-none">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
