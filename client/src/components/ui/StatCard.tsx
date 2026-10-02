import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  isPositive,
  icon,
  className,
}) => {
  return (
    <Card className={cn('flex flex-col justify-between p-6', className)}>
      <div className="flex items-center justify-between pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
          {label}
        </span>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-accent-light text-accent">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="font-headline text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          {value}
        </div>
        {change && (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                'inline-flex items-center font-semibold',
                isPositive ? 'text-success' : 'text-error'
              )}
            >
              <span className="material-symbols-outlined text-[14px]">
                {isPositive ? 'trending_up' : 'trending_down'}
              </span>
              {change}
            </span>
            <span className="text-secondary-text">vs last month</span>
          </div>
        )}
      </div>
    </Card>
  );
};
