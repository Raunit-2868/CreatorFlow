import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { UserRole } from '@/types';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export interface AppShellProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export const AppShell: React.FC<AppShellProps> = ({ currentRole, onRoleChange }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Left Sidebar (Sticky) */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar currentRole={currentRole} onRoleChange={onRoleChange} />
      </div>

      {/* Mobile Sidebar Overlay / Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#2B2B2B]/40 transition-opacity animate-in fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Mobile Sidebar Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 animate-in slide-in-from-left">
            <Sidebar
              currentRole={currentRole}
              onRoleChange={onRoleChange}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          currentRole={currentRole}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
