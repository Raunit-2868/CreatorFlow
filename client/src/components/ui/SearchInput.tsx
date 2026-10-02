import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, placeholder = 'Search...', onClear, ...props }, ref) => {
    return (
      <div className={cn('relative w-full', className)}>
        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text text-[18px]">
          search
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'flex h-10 w-full rounded-md border border-border bg-surface pl-9 pr-8 py-2 text-sm text-main-text placeholder:text-secondary-text shadow-subtle transition-all',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent'
          )}
          ref={ref}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-main-text p-0.5"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';
