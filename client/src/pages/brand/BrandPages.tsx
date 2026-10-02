import * as React from 'react';
import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '@/pages/shared/PlaceholderPage';

export const BrandDashboard: React.FC = () => (
  <PlaceholderPage
    title="Brand Overview"
    category="Brand Portal"
    description="Track your live marketing campaigns, creator roster performance, and budget utilization."
    stats={[
      { label: 'Live Campaigns', value: '6', change: '+1', isPositive: true, icon: 'campaign' },
      { label: 'Active Creators', value: '28', change: '+5', isPositive: true, icon: 'group' },
      { label: 'Total Reach', value: '2.4M', change: '+24%', isPositive: true, icon: 'public' },
      { label: 'Budget Allocated', value: '$64,000', icon: 'payments' },
    ]}
    primaryActionLabel="Create Campaign"
    onPrimaryAction={() => { window.location.href = '/brand/campaigns/new'; }}
  />
);

export const BrandInfluencerDiscovery: React.FC = () => (
  <PlaceholderPage
    title="Discover Creators"
    category="Influencers"
    description="Filter creators by niche, audience verification, engagement rate, and platform metrics."
    stats={[
      { label: 'Indexed Creators', value: '18,400', icon: 'person_search' },
      { label: 'Verified Media Kits', value: '4,200', icon: 'verified' },
      { label: 'Avg Creator ROI', value: '3.6x', isPositive: true, icon: 'trending_up' },
    ]}
  />
);

import { PublicInfluencerProfilePage } from '@/pages/public/PublicInfluencerProfilePage';

export const BrandInfluencerDetails: React.FC = () => {
  return <PublicInfluencerProfilePage />;
};

export const BrandCampaignsList: React.FC = () => (
  <PlaceholderPage
    title="Campaign Management"
    category="Campaigns"
    description="Manage existing brand briefs, draft campaigns, applications, and deliverable schedules."
    primaryActionLabel="New Campaign"
    onPrimaryAction={() => { window.location.href = '/brand/campaigns/new'; }}
  />
);

export const BrandCreateCampaign: React.FC = () => (
  <PlaceholderPage
    title="Create New Campaign"
    category="Campaigns"
    description="Step-by-step wizard to define brief objectives, required deliverables, target demographics, and budget."
  />
);

export const BrandCampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <PlaceholderPage
      title={`Campaign #${id || 'CAMP-104'}`}
      category="Campaigns"
      description="Review campaign performance metrics, roster of accepted creators, and incoming deliverable drafts."
    />
  );
};

export const BrandApplications: React.FC = () => (
  <PlaceholderPage
    title="Applicant Review"
    category="Applications"
    description="Review creator pitches, check AI match scores, and shortlist or accept creators for active campaigns."
    stats={[
      { label: 'Pending Review', value: '34', icon: 'inbox' },
      { label: 'Shortlisted', value: '12', icon: 'star' },
      { label: 'Accepted Roster', value: '18', icon: 'check_circle' },
    ]}
  />
);

export const BrandCollaborations: React.FC = () => (
  <PlaceholderPage
    title="Active Contracts"
    category="Collaborations"
    description="Review submitted content drafts, request revisions, and sign off on milestone escrow payouts."
  />
);

export const BrandMessages: React.FC = () => (
  <PlaceholderPage
    title="Brand Communications"
    category="Messages"
    description="Real-time messaging channels organized by campaign and creator partnerships."
  />
);

export const BrandNotifications: React.FC = () => (
  <PlaceholderPage
    title="Brand Notifications"
    category="Alerts"
    description="System alerts for new applicant pitches, deliverable submissions, and deadline milestones."
  />
);

export { BrandProfilePage as BrandProfile } from './BrandProfilePage';

export const BrandSettings: React.FC = () => (
  <PlaceholderPage
    title="Brand Settings"
    category="Settings"
    description="Team permissions, billing methods, invoice history, and security preferences."
  />
);
