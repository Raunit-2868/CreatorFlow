import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ApplyModal } from '@/components/application/ApplyModal';
import { InfluencerCampaignDetailsPage } from '@/pages/influencer/InfluencerCampaignDetailsPage';
import { InfluencerApplicationsPage } from '@/pages/influencer/InfluencerApplicationsPage';
import { BrandApplicationsPage } from '@/pages/brand/BrandApplicationsPage';
import { applicationService } from '@/services/applicationService';
import { campaignService } from '@/services/campaignService';
import { Campaign, Application } from '@/types';

// ─── mock applicationService ──────────────────────────────────────────────────
vi.mock('@/services/applicationService', () => ({
  applicationService: {
    createApplication: vi.fn(),
    getApplications: vi.fn(),
    getApplicationById: vi.fn(),
    shortlistApplication: vi.fn(),
    rejectApplication: vi.fn(),
    acceptApplication: vi.fn(),
    withdrawApplication: vi.fn(),
  },
}));

// ─── mock campaignService ─────────────────────────────────────────────────────
vi.mock('@/services/campaignService', () => ({
  campaignService: {
    getCampaigns: vi.fn(),
    getCampaignById: vi.fn(),
  },
}));

// ─── mock AuthContext ─────────────────────────────────────────────────────────
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'user-inf-1', name: 'Elena Rostova', email: 'elena@test.com', role: 'INFLUENCER' },
    isAuthenticated: true,
  }),
}));

// ─── mock data helpers ────────────────────────────────────────────────────────
const buildMockCampaign = (overrides: Partial<Campaign> = {}): Campaign => ({
  _id: 'camp-101',
  brandId: 'brand-999',
  title: 'Sustainable Summer Fashion Launch',
  description: 'Looking for lifestyle creators to produce aesthetic Reels.',
  category: 'Fashion & Lifestyle',
  budget: 4000,
  currency: 'USD',
  requiredPlatform: 'Instagram',
  deliverables: ['2x Reels', '3x Stories'],
  status: 'PUBLISHED',
  createdAt: new Date().toISOString(),
  ...overrides,
});

const buildMockApplication = (overrides: Partial<Application> = {}): Application => ({
  _id: 'app-501',
  campaignId: buildMockCampaign(),
  influencerId: { _id: 'user-inf-1', name: 'Elena Rostova', email: 'elena@test.com', role: 'INFLUENCER' },
  proposal: 'I would love to collaborate on this campaign! My audience loves high-end sustainable styling.',
  expectedCompensation: 1200,
  contentApproach: 'A 60s dynamic transition Reel featuring 3 outfit changes.',
  portfolioLinks: ['https://instagram.com/p/sample1'],
  relevantPreviousWork: 'Collaborated with Zara and Vogue Scandinavia.',
  status: 'PENDING',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  influencerProfile: {
    name: 'Elena Rostova',
    bio: 'Sustainable fashion and luxury aesthetics creator in Milan.',
    niche: ['Fashion', 'Luxury'],
    totalFollowers: 125000,
    avgEngagementRate: 4.6,
  },
  brandProfile: {
    companyName: 'Lumina Eco Wear',
  },
  ...overrides,
});

describe('Frontend Applications UI Tests (Phase 5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ApplyModal Component', () => {
    it('renders campaign details, proposal and compensation input fields', () => {
      const campaign = buildMockCampaign();
      render(
        <ApplyModal
          campaign={campaign}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      expect(screen.getByText('Campaign Application')).toBeInTheDocument();
      expect(screen.getByText(campaign.title)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/introduce yourself/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. 1200')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit application/i })).toBeInTheDocument();
    });

    it('shows validation error when proposal is too short', async () => {
      const campaign = buildMockCampaign();
      render(
        <ApplyModal
          campaign={campaign}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const proposalInput = screen.getByPlaceholderText(/introduce yourself/i);
      fireEvent.change(proposalInput, { target: { value: 'Short' } });

      const submitButton = screen.getByRole('button', { name: /submit application/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
      });
      expect(applicationService.createApplication).not.toHaveBeenCalled();
    });

    it('submits valid application and shows submission confirmation', async () => {
      const campaign = buildMockCampaign();
      const mockCreatedApp = buildMockApplication();
      vi.mocked(applicationService.createApplication).mockResolvedValueOnce(mockCreatedApp);

      const onSuccess = vi.fn();
      render(
        <ApplyModal
          campaign={campaign}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={onSuccess}
        />
      );

      const proposalInput = screen.getByPlaceholderText(/introduce yourself/i);
      fireEvent.change(proposalInput, {
        target: { value: 'Excited to pitch dynamic Reels for your summer launch.' },
      });

      const compensationInput = screen.getByPlaceholderText('e.g. 1200');
      fireEvent.change(compensationInput, { target: { value: '1500' } });

      const submitButton = screen.getByRole('button', { name: /submit application/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(applicationService.createApplication).toHaveBeenCalledWith({
          campaignId: campaign._id,
          proposal: 'Excited to pitch dynamic Reels for your summer launch.',
          expectedCompensation: 1500,
          contentApproach: undefined,
          portfolioLinks: undefined,
          relevantPreviousWork: undefined,
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Application Submitted!')).toBeInTheDocument();
      });
    });
  });

  describe('InfluencerCampaignDetailsPage — Apply Flow', () => {
    it('renders "Apply Now" button and opens ApplyModal when clicked', async () => {
      const campaign = buildMockCampaign();
      vi.mocked(campaignService.getCampaignById).mockResolvedValueOnce(campaign);
      vi.mocked(applicationService.getApplications).mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
      });

      render(
        <MemoryRouter initialEntries={[`/influencer/campaigns/${campaign._id}`]}>
          <Routes>
            <Route path="/influencer/campaigns/:id" element={<InfluencerCampaignDetailsPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(campaign.title)).toBeInTheDocument();
      });

      const applyButton = screen.getByRole('button', { name: /apply now/i });
      expect(applyButton).toBeInTheDocument();

      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText('Campaign Application')).toBeInTheDocument();
      });
    });

    it('renders "Application Submitted" status when influencer already applied', async () => {
      const campaign = buildMockCampaign();
      const existingApp = buildMockApplication({ status: 'PENDING' });
      vi.mocked(campaignService.getCampaignById).mockResolvedValueOnce(campaign);
      vi.mocked(applicationService.getApplications).mockResolvedValueOnce({
        data: [existingApp],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      render(
        <MemoryRouter initialEntries={[`/influencer/campaigns/${campaign._id}`]}>
          <Routes>
            <Route path="/influencer/campaigns/:id" element={<InfluencerCampaignDetailsPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/application submitted/i)).toBeInTheDocument();
        expect(screen.getByText('PENDING')).toBeInTheDocument();
        expect(screen.getByText(/view in my applications/i)).toBeInTheDocument();
      });
    });
  });

  describe('InfluencerApplicationsPage — My Applications', () => {
    it('renders applications list with status badges and metrics', async () => {
      const apps = [
        buildMockApplication({ _id: 'app-1', status: 'PENDING' }),
        buildMockApplication({
          _id: 'app-2',
          status: 'SHORTLISTED',
          campaignId: buildMockCampaign({ title: 'Gourmet Coffee Campaign' }),
        }),
      ];
      vi.mocked(applicationService.getApplications).mockResolvedValueOnce({
        data: apps,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });

      render(
        <MemoryRouter>
          <InfluencerApplicationsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('My Applications')).toBeInTheDocument();
        expect(screen.getByText('Sustainable Summer Fashion Launch')).toBeInTheDocument();
        expect(screen.getByText('Gourmet Coffee Campaign')).toBeInTheDocument();
        expect(screen.getByText(/pending review/i)).toBeInTheDocument();
        expect(screen.getAllByText(/shortlisted/i).length).toBeGreaterThan(0);
      });
    });

    it('shows empty state when no applications exist', async () => {
      vi.mocked(applicationService.getApplications).mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      render(
        <MemoryRouter>
          <InfluencerApplicationsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No Applications Found')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /discover open campaigns/i })).toBeInTheDocument();
      });
    });

    it('opens withdrawal modal and calls withdrawApplication on confirm', async () => {
      const app = buildMockApplication({ _id: 'app-withdraw-1', status: 'PENDING' });
      vi.mocked(applicationService.getApplications).mockResolvedValueOnce({
        data: [app],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      vi.mocked(applicationService.withdrawApplication).mockResolvedValueOnce({
        ...app,
        status: 'WITHDRAWN',
      });

      render(
        <MemoryRouter>
          <InfluencerApplicationsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Sustainable Summer Fashion Launch')).toBeInTheDocument();
      });

      const withdrawButton = screen.getByRole('button', { name: /^withdraw$/i });
      fireEvent.click(withdrawButton);

      await waitFor(() => {
        expect(screen.getByText('Withdraw Application?')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm withdrawal/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(applicationService.withdrawApplication).toHaveBeenCalledWith('app-withdraw-1');
      });
    });
  });

  describe('BrandApplicationsPage — Applicant Management', () => {
    it('renders incoming applicants list with creator info and stats', async () => {
      const app = buildMockApplication();
      vi.mocked(campaignService.getCampaigns).mockResolvedValueOnce({
        data: [buildMockCampaign()],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      vi.mocked(applicationService.getApplications).mockResolvedValueOnce({
        data: [app],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      render(
        <MemoryRouter>
          <BrandApplicationsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Campaign Applications')).toBeInTheDocument();
        expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
        expect(screen.getByText(/125,000 followers/i)).toBeInTheDocument();
        expect(screen.getByText(/4.6% engagement/i)).toBeInTheDocument();
        expect(screen.getByText('$1,200 USD')).toBeInTheDocument();
      });
    });

    it('allows brand to shortlist a pending applicant', async () => {
      const app = buildMockApplication({ _id: 'app-shortlist-1', status: 'PENDING' });
      vi.mocked(campaignService.getCampaigns).mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
      vi.mocked(applicationService.getApplications).mockResolvedValueOnce({
        data: [app],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      vi.mocked(applicationService.shortlistApplication).mockResolvedValueOnce({
        ...app,
        status: 'SHORTLISTED',
      });

      render(
        <MemoryRouter>
          <BrandApplicationsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
      });

      const shortlistBtn = screen.getByTitle('Shortlist applicant');
      fireEvent.click(shortlistBtn);

      await waitFor(() => {
        expect(applicationService.shortlistApplication).toHaveBeenCalledWith('app-shortlist-1');
      });
    });

    it('allows brand to accept an application', async () => {
      const app = buildMockApplication({ _id: 'app-accept-1', status: 'PENDING' });
      vi.mocked(campaignService.getCampaigns).mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
      vi.mocked(applicationService.getApplications).mockResolvedValueOnce({
        data: [app],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      vi.mocked(applicationService.acceptApplication).mockResolvedValueOnce({
        ...app,
        status: 'ACCEPTED',
      });

      render(
        <MemoryRouter>
          <BrandApplicationsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
      });

      const acceptBtn = screen.getByTitle('Accept application');
      fireEvent.click(acceptBtn);

      await waitFor(() => {
        expect(applicationService.acceptApplication).toHaveBeenCalledWith('app-accept-1');
      });
    });

    it('opens detailed review modal when clicking Review', async () => {
      const app = buildMockApplication();
      vi.mocked(campaignService.getCampaigns).mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
      vi.mocked(applicationService.getApplications).mockResolvedValue({
        data: [app],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      render(
        <MemoryRouter>
          <BrandApplicationsPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
      });

      const reviewBtn = screen.getByRole('button', { name: /^review$/i });
      fireEvent.click(reviewBtn);

      await waitFor(() => {
        expect(screen.getByText('Proposal & Pitch')).toBeInTheDocument();
        expect(screen.getAllByText(app.proposal).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Creative Content Approach')).toBeInTheDocument();
        expect(screen.getByText(app.contentApproach!)).toBeInTheDocument();
      });
    });
  });
});
