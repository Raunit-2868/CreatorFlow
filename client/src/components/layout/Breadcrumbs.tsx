import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  const location = useLocation();

  // If no items provided, generate from current pathname
  const breadcrumbs: BreadcrumbItem[] = items || (() => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.map((part, idx) => {
      const href = '/' + parts.slice(0, idx + 1).join('/');
      const label = part
        .replace(/-/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase());
      return { label, href: idx === parts.length - 1 ? undefined : href };
    });
  })();

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className={cn('flex items-center space-x-1.5 text-xs text-secondary-text', className)}>
      <Link to="/" className="hover:text-primary transition-colors flex items-center">
        <span className="material-symbols-outlined text-[16px]">home</span>
      </Link>
      {breadcrumbs.map((crumb, idx) => (
        <React.Fragment key={idx}>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          {crumb.href ? (
            <Link to={crumb.href} className="hover:text-primary transition-colors font-medium">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-primary font-semibold">{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
