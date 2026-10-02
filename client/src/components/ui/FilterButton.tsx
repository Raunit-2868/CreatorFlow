import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface FilterButtonProps {
  label: string;
  activeCount?: number;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  label,
  activeCount,
  isActive = false,
  onClick,
  className,
}) => {
  return (
    <Button
      variant={isActive ? 'accent' : 'secondary'}
      size="md"
      onClick={onClick}
      className={cn('inline-flex items-center gap-2', className)}
    >
      <span className="material-symbols-outlined text-[18px]">tune</span>
      <span>{label}</span>
      {activeCount !== undefined && activeCount > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary text-xs font-bold">
          {activeCount}
        </span>
      )}
    </Button>
  );
};
