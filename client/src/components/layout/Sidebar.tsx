import * as React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavItem, UserRole } from '@/types';
import { getNavItemsForRole } from '@/components/navigation/navConfig';

import { useAuth } from '@/context/AuthContext';

export interface SidebarProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  className?: string;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  onRoleChange,
  className,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const navItems: NavItem[] = getNavItemsForRole(currentRole);

  const displayName = user?.name || (
    currentRole === 'INFLUENCER'
      ? 'Jordan Davis'
      : currentRole === 'BRAND'
      ? 'Nike Brand Team'
      : 'Admin Officer'
  );

  const displayHandle = user?.email || (
    currentRole === 'INFLUENCER'
      ? '@jordandavis'
      : currentRole === 'BRAND'
      ? 'partnerships@nike.com'
      : 'admin@creatorflow.io'
  );

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col justify-between border-r border-border bg-surface select-none',
        className
      )}
    >
      {/* Brand & Logo Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-6 border-b border-border/60">
          <Link
            to={`/${currentRole.toLowerCase()}`}
            className="flex items-center gap-2.5"
            onClick={onCloseMobile}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white font-headline font-bold text-base shadow-subtle">
              CF
            </div>
            <span className="font-headline font-extrabold text-lg tracking-tight text-primary">
              CreatorFlow
            </span>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-secondary-text hover:text-main-text"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Role Selector Pill */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between rounded-md bg-background px-3 py-1.5 border border-border">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
              Portal Mode
            </span>
            <span className="rounded-sm bg-accent-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/20">
              {currentRole}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 px-3 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === `/${currentRole.toLowerCase()}`}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent-light text-primary font-semibold border-l-2 border-accent shadow-subtle'
                    : 'text-secondary-text hover:bg-background hover:text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'material-symbols-outlined text-[20px]',
                        isActive ? 'text-accent fill' : 'text-secondary-text'
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / User Profile & Role Switcher */}
      <div className="p-4 border-t border-border/60 space-y-3">
        {onRoleChange && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary-text block px-1">
              Switch Preview Role
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(['INFLUENCER', 'BRAND', 'ADMIN'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onRoleChange(r)}
                  className={cn(
                    'rounded-sm py-1 text-[11px] font-medium transition-colors text-center border',
                    currentRole === r
                      ? 'bg-primary text-white border-primary font-semibold'
                      : 'bg-surface text-secondary-text border-border hover:bg-surface-hover'
                  )}
                >
                  {r.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs select-none shadow-subtle">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-xs font-bold text-primary">
              {displayName}
            </div>
            <div className="truncate text-[11px] text-secondary-text">
              {displayHandle}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
