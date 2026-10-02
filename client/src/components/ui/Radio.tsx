import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, ...props }, ref) => {
    return (
      <div className="flex items-start space-x-2.5">
        <input
          type="radio"
          id={id}
          className={cn(
            'h-4 w-4 rounded-full border border-border bg-surface text-primary focus:ring-1 focus:ring-accent transition-colors cursor-pointer',
            className
          )}
          ref={ref}
          {...props}
        />
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
Radio.displayName = 'Radio';
