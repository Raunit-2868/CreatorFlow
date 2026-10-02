import * as React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';

export interface PlaceholderPageProps {
  title: string;
  description: string;
  category: string;
  stats?: { label: string; value: string | number; change?: string; isPositive?: boolean; icon?: string }[];
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  category,
  stats,
  primaryActionLabel,
  onPrimaryAction,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ label: category }, { label: title }]}
        actions={
          primaryActionLabel && (
            <Button variant="primary" onClick={onPrimaryAction}>
              <span className="material-symbols-outlined text-[18px] mr-1.5">add</span>
              {primaryActionLabel}
            </Button>
          )
        }
      />

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <StatCard
              key={idx}
              label={s.label}
              value={s.value}
              change={s.change}
              isPositive={s.isPositive}
              icon={s.icon}
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title} Module</CardTitle>
            <span className="rounded-sm bg-accent-light px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-accent border border-accent/20">
              Phase 1 Shell Active
            </span>
          </div>
          <CardDescription>
            This view is configured with the approved CreatorFlow Light Design System.
            Full business workflows and data endpoints will be integrated in subsequent phases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed border-border bg-background/50 p-8 text-center space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent">
              <span className="material-symbols-outlined text-[20px]">layers</span>
            </div>
            <div className="text-sm font-semibold text-primary">{title} Workspace Ready</div>
            <p className="text-xs text-secondary-text max-w-md mx-auto">
              Surface palette (`#FAF9F6`), canvas (`#F5F2EB`), and primary elements (`#2B2B2B`)
              are verified and ready for domain state binding.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
