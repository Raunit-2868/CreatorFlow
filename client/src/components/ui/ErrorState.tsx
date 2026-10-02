import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-error/30 bg-surface p-10 text-center shadow-subtle',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-light text-error mb-4">
        <span className="material-symbols-outlined text-[24px]">error</span>
      </div>
      <h3 className="font-headline text-lg font-bold text-primary">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-secondary-text">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="md" className="mt-6" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
