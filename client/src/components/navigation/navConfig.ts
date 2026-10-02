import { NavItem, UserRole } from '@/types';

export const INFLUENCER_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/influencer', icon: 'grid_view' },
  { label: 'Discover Campaigns', href: '/influencer/campaigns', icon: 'explore' },
  { label: 'Applications', href: '/influencer/applications', icon: 'assignment' },
  { label: 'Collaborations', href: '/influencer/collaborations', icon: 'handshake' },
  { label: 'Messages', href: '/influencer/messages', icon: 'chat_bubble', badge: 2 },
  { label: 'Notifications', href: '/influencer/notifications', icon: 'notifications', badge: 3 },
  { label: 'My Profile', href: '/influencer/profile', icon: 'person' },
  { label: 'Settings', href: '/influencer/settings', icon: 'settings' },
];

export const BRAND_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/brand', icon: 'grid_view' },
  { label: 'Discover Influencers', href: '/brand/influencers', icon: 'person_search' },
  { label: 'Campaigns', href: '/brand/campaigns', icon: 'campaign' },
  { label: 'Applications', href: '/brand/applications', icon: 'assignment_ind' },
  { label: 'Collaborations', href: '/brand/collaborations', icon: 'handshake' },
  { label: 'Messages', href: '/brand/messages', icon: 'chat_bubble' },
  { label: 'Notifications', href: '/brand/notifications', icon: 'notifications' },
  { label: 'Company Profile', href: '/brand/profile', icon: 'corporate_fare' },
  { label: 'Settings', href: '/brand/settings', icon: 'settings' },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { label: 'Users', href: '/admin/users', icon: 'group' },
  { label: 'Campaigns', href: '/admin/campaigns', icon: 'campaign' },
  { label: 'Reports', href: '/admin/reports', icon: 'summarize' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'monitoring' },
  { label: 'Settings', href: '/admin/settings', icon: 'settings' },
];

export const getNavItemsForRole = (role: UserRole): NavItem[] => {
  switch (role) {
    case 'INFLUENCER':
      return INFLUENCER_NAV_ITEMS;
    case 'BRAND':
      return BRAND_NAV_ITEMS;
    case 'ADMIN':
      return ADMIN_NAV_ITEMS;
    default:
      return INFLUENCER_NAV_ITEMS;
  }
};
