import * as React from 'react';
import { PlaceholderPage } from '@/pages/shared/PlaceholderPage';

export const AdminDashboard: React.FC = () => (
  <PlaceholderPage
    title="Platform Operations"
    category="Admin Portal"
    description="Global system telemetry, GMV metrics, active user registrations, and platform moderation queue."
    stats={[
      { label: 'Total Creators', value: '18,400', isPositive: true, icon: 'group' },
      { label: 'Registered Brands', value: '1,240', isPositive: true, icon: 'corporate_fare' },
      { label: 'Platform GMV', value: '$1.82M', change: '+32%', isPositive: true, icon: 'payments' },
      { label: 'Pending Moderation', value: '8', icon: 'shield' },
    ]}
  />
);

export const AdminUsers: React.FC = () => (
  <PlaceholderPage
    title="User Moderation & Directory"
    category="Management"
    description="Inspect user credentials, verify media kits, suspend non-compliant accounts, and assign roles."
  />
);

export const AdminCampaigns: React.FC = () => (
  <PlaceholderPage
    title="Global Campaign Oversight"
    category="Management"
    description="Review all platform campaigns for policy compliance, budget escrow validity, and brand integrity."
  />
);

export const AdminReports: React.FC = () => (
  <PlaceholderPage
    title="Compliance & Dispute Reports"
    category="Oversight"
    description="Mediate creator-brand deliverable disputes and review flagged communication threads."
  />
);

export const AdminAnalytics: React.FC = () => (
  <PlaceholderPage
    title="Platform Intelligence & KPIs"
    category="Analytics"
    description="Gross marketplace value, user retention cohorts, API response times, and AI match efficacy."
  />
);

export const AdminSettings: React.FC = () => (
  <PlaceholderPage
    title="Global System Settings"
    category="System"
    description="API rate limits, platform commission percentage, vector database indexing, and maintenance mode."
  />
);
