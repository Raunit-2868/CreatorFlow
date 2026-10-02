import * as React from 'react';
import { useParams } from 'react-router-dom';
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

export const InfluencerCampaignDiscovery: React.FC = () => (
  <PlaceholderPage
    title="Discover Campaigns"
    category="Campaigns"
    description="Browse active brand campaigns matching your niche, audience profile, and minimum rates."
    stats={[
      { label: 'Open Briefs', value: '142', icon: 'campaign' },
      { label: 'Top AI Matches', value: '18', icon: 'sparkles' },
      { label: 'Avg Budget', value: '$2,200', icon: 'payments' },
    ]}
  />
);

export const InfluencerCampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <PlaceholderPage
      title={`Campaign Brief #${id || 'CAMP-104'}`}
      category="Campaigns"
      description="Deliverables schedule, target audience guidelines, moodboard, and rate proposal."
      primaryActionLabel="Submit Proposal"
    />
  );
};

export const InfluencerApplications: React.FC = () => (
  <PlaceholderPage
    title="My Applications"
    category="Applications"
    description="Track status across submitted pitches: Under Review, Shortlisted, and Accepted deals."
    stats={[
      { label: 'Total Submitted', value: '23', icon: 'send' },
      { label: 'Shortlisted', value: '5', icon: 'star' },
      { label: 'Accepted Rate', value: '38%', icon: 'check_circle' },
    ]}
  />
);

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

export const InfluencerProfile: React.FC = () => (
  <PlaceholderPage
    title="Media Kit & Profile"
    category="Profile"
    description="Curate your portfolio, connected social platforms, demographics, and baseline rate card."
    primaryActionLabel="Edit Media Kit"
  />
);

export const InfluencerSettings: React.FC = () => (
  <PlaceholderPage
    title="Account Settings"
    category="Preferences"
    description="Security credentials, notification preferences, and payout banking details."
  />
);
