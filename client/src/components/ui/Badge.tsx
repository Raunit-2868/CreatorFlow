import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface border border-border text-secondary-text',
        primary: 'bg-primary text-white',
        accent: 'bg-accent-light text-accent border border-accent/30',
        success: 'bg-success-light text-success border border-success/30',
        warning: 'bg-warning-light text-warning border border-warning/30',
        destructive: 'bg-error-light text-error border border-error/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
};
Badge.displayName = 'Badge';
