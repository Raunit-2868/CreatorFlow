import * as React from 'react';
import { PlaceholderPage } from '@/pages/shared/PlaceholderPage';

export const InfluencerDashboard: React.FC = () => (
  <PlaceholderPage
    title="Creator Dashboard"
    category="Creator Portal"
    description="Overview of your active brand campaigns, pending applications, and recent earnings."
    stats={[
      { label: 'Active Deals', value: '4', change: '+2', isPositive: true, icon: 'handshake' },
      { label: 'Monthly Earnings', value: '$8,450', change: '+18%', isPositive: true, icon: 'payments' },
      { label: 'Pending Pitches', value: '7', change: '-1', isPositive: false, icon: 'assignment' },
      { label: 'Avg Engagement', value: '4.8%', change: '+0.3%', isPositive: true, icon: 'trending_up' },
    ]}
    primaryActionLabel="Browse Opportunities"
    onPrimaryAction={() => { window.location.href = '/influencer/campaigns'; }}
  />
);

// Phase 4 — Real campaign pages
export { InfluencerCampaignDiscoveryPage as InfluencerCampaignDiscovery } from './InfluencerCampaignDiscoveryPage';
export { InfluencerCampaignDetailsPage as InfluencerCampaignDetails } from './InfluencerCampaignDetailsPage';

// Phase 5 — Real applications page
export { InfluencerApplicationsPage as InfluencerApplications } from './InfluencerApplicationsPage';

export const InfluencerCollaborations: React.FC = () => (
  <PlaceholderPage
    title="Active Collaborations"
    category="Workspace"
    description="Manage live deliverable submissions, brand revisions, and milestone sign-offs."
    stats={[
      { label: 'Deliverables Due', value: '3', isPositive: false, icon: 'schedule' },
      { label: 'In Brand Review', value: '2', icon: 'visibility' },
      { label: 'Ready for Payout', value: '$3,500', isPositive: true, icon: 'paid' },
    ]}
  />
);

export const InfluencerMessages: React.FC = () => (
  <PlaceholderPage
    title="Direct Messages"
    category="Communications"
    description="Live chat threads with brand managers and campaign coordinators."
  />
);

export const InfluencerNotifications: React.FC = () => (
  <PlaceholderPage
    title="Notifications & Alerts"
    category="Activity"
    description="Real-time updates regarding application status changes, deliverable reviews, and payouts."
  />
);

export { InfluencerProfilePage as InfluencerProfile } from './InfluencerProfilePage';

export const InfluencerSettings: React.FC = () => (
  <PlaceholderPage
    title="Account Settings"
    category="Preferences"
    description="Security credentials, notification preferences, and payout banking details."
  />
);
