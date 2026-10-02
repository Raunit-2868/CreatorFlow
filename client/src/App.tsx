import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';

// Public pages
import { LandingPage } from '@/pages/public/LandingPage';
import { SignInPage } from '@/pages/public/SignInPage';
import { RegisterPage } from '@/pages/public/RegisterPage';
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/public/ResetPasswordPage';

import { PublicInfluencerProfilePage } from '@/pages/public/PublicInfluencerProfilePage';
import { PublicBrandProfilePage } from '@/pages/public/PublicBrandProfilePage';

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
  BrandEditCampaign,
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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/influencers/:id" element={<PublicInfluencerProfilePage />} />
          <Route path="/brands/:id" element={<PublicBrandProfilePage />} />

          {/* Influencer Portal Routes - Protected & Role-guarded */}
          <Route
            path="/influencer"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['INFLUENCER', 'ADMIN']}>
                  <PortalShellWrapper role="INFLUENCER" />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          >
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

          {/* Brand Portal Routes - Protected & Role-guarded */}
          <Route
            path="/brand"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['BRAND', 'ADMIN']}>
                  <PortalShellWrapper role="BRAND" />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<BrandDashboard />} />
            <Route path="influencers" element={<BrandInfluencerDiscovery />} />
            <Route path="influencers/:id" element={<BrandInfluencerDetails />} />
            <Route path="campaigns" element={<BrandCampaignsList />} />
            <Route path="campaigns/new" element={<BrandCreateCampaign />} />
            <Route path="campaigns/:id/edit" element={<BrandEditCampaign />} />
            <Route path="campaigns/:id" element={<BrandCampaignDetails />} />
            <Route path="applications" element={<BrandApplications />} />
            <Route path="collaborations" element={<BrandCollaborations />} />
            <Route path="messages" element={<BrandMessages />} />
            <Route path="notifications" element={<BrandNotifications />} />
            <Route path="profile" element={<BrandProfile />} />
            <Route path="settings" element={<BrandSettings />} />
          </Route>

          {/* Admin Portal Routes - Protected & Strictly Admin-guarded */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['ADMIN']}>
                  <PortalShellWrapper role="ADMIN" />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          >
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
    </AuthProvider>
  );
};

export default App;
