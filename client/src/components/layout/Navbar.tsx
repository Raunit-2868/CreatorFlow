import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { Dropdown } from '@/components/ui/Dropdown';

export interface NavbarProps {
  currentRole: UserRole;
  onToggleMobileSidebar: () => void;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onToggleMobileSidebar,
  className,
}) => {
  const [searchValue, setSearchValue] = React.useState('');

  const userMenuItems = [
    {
      label: 'My Profile',
      icon: 'person',
      onClick: () => {
        window.location.href = `/${currentRole.toLowerCase()}/profile`;
      },
    },
    {
      label: 'Settings',
      icon: 'settings',
      onClick: () => {
        window.location.href = `/${currentRole.toLowerCase()}/settings`;
      },
    },
    {
      label: 'Help & Docs',
      icon: 'help',
      divider: true,
      onClick: () => {
        alert('CreatorFlow Documentation & Support Portal');
      },
    },
    {
      label: 'Sign Out',
      icon: 'logout',
      destructive: true,
      onClick: () => {
        window.location.href = '/login';
      },
    },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4 sm:px-6 shadow-subtle',
        className
      )}
    >
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-md text-secondary-text hover:text-main-text hover:bg-background transition-colors"
          aria-label="Toggle Navigation"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden sm:block w-72 md:w-96">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search campaigns, creators, deliverables..."
            className="flex h-9 w-full rounded-md border border-border bg-background pl-9 pr-12 text-xs text-main-text placeholder:text-secondary-text transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-secondary-text">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right: Notification bell, messages, role badge, profile dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Messages Shortcut */}
        <Link
          to={`/${currentRole.toLowerCase()}/messages`}
          className="relative rounded-md p-2 text-secondary-text hover:bg-background hover:text-primary transition-colors"
          title="Messages"
        >
          <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-accent" />
        </Link>

        {/* Notifications Shortcut */}
        <Link
          to={`/${currentRole.toLowerCase()}/notifications`}
          className="relative rounded-md p-2 text-secondary-text hover:bg-background hover:text-primary transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-error" />
        </Link>

        <div className="h-5 w-[1px] bg-border mx-1" />

        {/* User Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center gap-2 p-1 rounded-md hover:bg-background transition-colors cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs select-none">
                {currentRole === 'INFLUENCER' ? 'JD' : currentRole === 'BRAND' ? 'NK' : 'AD'}
              </div>
              <span className="hidden md:block text-xs font-semibold text-primary">
                {currentRole === 'INFLUENCER'
                  ? 'Jordan Davis'
                  : currentRole === 'BRAND'
                  ? 'Nike Team'
                  : 'Admin'}
              </span>
              <span className="material-symbols-outlined text-secondary-text text-[18px]">
                expand_more
              </span>
            </div>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
};
