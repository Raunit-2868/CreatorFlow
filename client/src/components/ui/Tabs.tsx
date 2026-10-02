import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex items-center space-x-1 border-b border-border', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'group inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-all select-none',
              isActive
                ? 'border-accent text-primary font-semibold'
                : 'border-transparent text-secondary-text hover:border-border hover:text-main-text'
            )}
          >
            {tab.icon && (
              <span className={cn('material-symbols-outlined text-[18px]', isActive ? 'text-accent' : 'text-secondary-text')}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  isActive ? 'bg-accent-light text-accent' : 'bg-surface border border-border text-secondary-text'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
