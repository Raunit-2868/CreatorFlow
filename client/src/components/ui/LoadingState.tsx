import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading CreatorFlow...',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent animate-spin mb-3">
        <span className="material-symbols-outlined text-[24px]">progress_activity</span>
      </div>
      <p className="text-sm font-medium text-secondary-text">{message}</p>
    </div>
  );
};
