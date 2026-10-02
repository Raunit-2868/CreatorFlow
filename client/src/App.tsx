import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { AppShell } from '@/components/layout/AppShell';

// Public pages
import { LandingPage } from '@/pages/public/LandingPage';
import { SignInPage } from '@/pages/public/SignInPage';
import { RegisterPage } from '@/pages/public/RegisterPage';

// Influencer pages
import {
  InfluencerDashboard,
  InfluencerCampaignDiscovery,
  InfluencerCampaignDetails,
  InfluencerApplications,
  InfluencerCollaborations,
  InfluencerMessages,
  InfluencerNotifications,
  InfluencerProfile,
  InfluencerSettings,
} from '@/pages/influencer/InfluencerPages';

// Brand pages
import {
  BrandDashboard,
  BrandInfluencerDiscovery,
  BrandInfluencerDetails,
  BrandCampaignsList,
  BrandCreateCampaign,
  BrandCampaignDetails,
  BrandApplications,
  BrandCollaborations,
  BrandMessages,
  BrandNotifications,
  BrandProfile,
  BrandSettings,
} from '@/pages/brand/BrandPages';

// Admin pages
import {
  AdminDashboard,
  AdminUsers,
  AdminCampaigns,
  AdminReports,
  AdminAnalytics,
  AdminSettings,
} from '@/pages/admin/AdminPages';

// Layout wrapper that syncs role with active route
const PortalShellWrapper: React.FC<{ role: UserRole }> = ({ role }) => {
  const navigate = useNavigate();

  const handleRoleChange = (newRole: UserRole) => {
    navigate(`/${newRole.toLowerCase()}`);
  };

  return <AppShell currentRole={role} onRoleChange={handleRoleChange} />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Influencer Portal Routes */}
        <Route path="/influencer" element={<PortalShellWrapper role="INFLUENCER" />}>
          <Route index element={<InfluencerDashboard />} />
          <Route path="campaigns" element={<InfluencerCampaignDiscovery />} />
          <Route path="campaigns/:id" element={<InfluencerCampaignDetails />} />
          <Route path="applications" element={<InfluencerApplications />} />
          <Route path="collaborations" element={<InfluencerCollaborations />} />
          <Route path="messages" element={<InfluencerMessages />} />
          <Route path="notifications" element={<InfluencerNotifications />} />
          <Route path="profile" element={<InfluencerProfile />} />
          <Route path="settings" element={<InfluencerSettings />} />
        </Route>

        {/* Brand Portal Routes */}
        <Route path="/brand" element={<PortalShellWrapper role="BRAND" />}>
          <Route index element={<BrandDashboard />} />
          <Route path="influencers" element={<BrandInfluencerDiscovery />} />
          <Route path="influencers/:id" element={<BrandInfluencerDetails />} />
          <Route path="campaigns" element={<BrandCampaignsList />} />
          <Route path="campaigns/new" element={<BrandCreateCampaign />} />
          <Route path="campaigns/:id" element={<BrandCampaignDetails />} />
          <Route path="applications" element={<BrandApplications />} />
          <Route path="collaborations" element={<BrandCollaborations />} />
          <Route path="messages" element={<BrandMessages />} />
          <Route path="notifications" element={<BrandNotifications />} />
          <Route path="profile" element={<BrandProfile />} />
          <Route path="settings" element={<BrandSettings />} />
        </Route>

        {/* Admin Portal Routes */}
        <Route path="/admin" element={<PortalShellWrapper role="ADMIN" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
