import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between py-4 border-t border-border/60', className)}>
      <div className="text-xs text-secondary-text">
        Page <span className="font-semibold text-main-text">{currentPage}</span> of{' '}
        <span className="font-semibold text-main-text">{totalPages}</span>
      </div>

      <div className="flex items-center space-x-1.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <span className="material-symbols-outlined text-[16px] mr-1">chevron_left</span>
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
          <span className="material-symbols-outlined text-[16px] ml-1">chevron_right</span>
        </Button>
      </div>
    </div>
  );
};
