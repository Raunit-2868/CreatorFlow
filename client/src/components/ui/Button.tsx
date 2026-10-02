import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-subtle',
        secondary: 'bg-surface text-primary border border-border hover:bg-surface-hover shadow-subtle',
        accent: 'bg-accent text-accent-foreground hover:bg-accent-hover shadow-subtle',
        outline: 'border border-border bg-transparent text-main-text hover:bg-surface-hover',
        ghost: 'text-secondary-text hover:text-main-text hover:bg-surface-hover',
        destructive: 'bg-error text-white hover:bg-error/90 shadow-subtle',
        link: 'text-accent underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-sm',
        md: 'h-10 px-4 py-2 text-sm rounded-md',
        lg: 'h-12 px-6 text-base rounded-md',
        icon: 'h-10 w-10 p-0 rounded-md',
        'icon-sm': 'h-8 w-8 p-0 rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="material-symbols-outlined animate-spin mr-2 text-[16px]">
            progress_activity
          </span>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
