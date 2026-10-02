import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { InfluencerCampaignDiscoveryPage } from '../pages/influencer/InfluencerCampaignDiscoveryPage';
import { InfluencerCampaignDetailsPage } from '../pages/influencer/InfluencerCampaignDetailsPage';
import { BrandCampaignListPage } from '../pages/brand/BrandCampaignListPage';
import { BrandCampaignDetailsPage } from '../pages/brand/BrandCampaignDetailsPage';
import { campaignService } from '@/services/campaignService';
import { Campaign } from '../types';

// ─── mock campaignService ────────────────────────────────────────────────────
vi.mock('@/services/campaignService', () => ({
  campaignService: {
    getCampaigns: vi.fn(),
    getCampaignById: vi.fn(),
    createCampaign: vi.fn(),
    updateCampaign: vi.fn(),
    deleteCampaign: vi.fn(),
    publishCampaign: vi.fn(),
    closeCampaign: vi.fn(),
  },
}));

// ─── mock AuthContext so it never throws ────────────────────────────────────
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'user-brand-1', name: 'Nova Brand', email: 'brand@test.com', role: 'BRAND' },
    isAuthenticated: true,
  }),
}));

// ─── helpers ────────────────────────────────────────────────────────────────
const buildCampaign = (overrides: Partial<Campaign> = {}): Campaign => ({
  _id: 'camp-123',
  brandId: 'user-brand-1',
  title: 'Summer Luxury Reels Campaign',
  description: 'Promote our summer collection across key lifestyle influencers.',
  category: 'Fashion & Lifestyle',
  budget: 5000,
  currency: 'USD',
  targetAudience: 'Women 25–35',
  location: 'Mumbai',
  requiredPlatform: 'Instagram',
  followerRange: { min: 10000, max: 500000 },
  engagementRequirement: 3.5,
  contentType: 'Reel',
  deliverables: ['3x Reels', '5x Stories'],
  applicationDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
  campaignDeadline: new Date(Date.now() + 30 * 86400000).toISOString(),
  status: 'PUBLISHED',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const emptyPaginatedResponse = () => ({
  data: [],
  pagination: { page: 1, limit: 15, total: 0, totalPages: 0 },
});

describe('Frontend Campaign UI Tests (Phase 4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Influencer Discovery Page ─────────────────────────────────────────────
  describe('InfluencerCampaignDiscoveryPage', () => {
    it('shows empty state when no campaigns are returned', async () => {
      vi.mocked(campaignService.getCampaigns).mockResolvedValue(emptyPaginatedResponse());

      render(
        <MemoryRouter>
          <InfluencerCampaignDiscoveryPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/No Campaigns Found/i)).toBeInTheDocument();
      });
    });

    it('renders campaign cards with title, budget, and platform', async () => {
      vi.mocked(campaignService.getCampaigns).mockResolvedValue({
        data: [buildCampaign()],
        pagination: { page: 1, limit: 15, total: 1, totalPages: 1 },
      });

      render(
        <MemoryRouter>
          <InfluencerCampaignDiscoveryPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Summer Luxury Reels Campaign')).toBeInTheDocument();
      });

      expect(screen.getByText(/USD 5,000/i)).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
    });

    it('renders multiple campaign cards', async () => {
      vi.mocked(campaignService.getCampaigns).mockResolvedValue({
        data: [
          buildCampaign({ title: 'Campaign Alpha', _id: 'c1' }),
          buildCampaign({ title: 'Campaign Beta', _id: 'c2' }),
          buildCampaign({ title: 'Campaign Gamma', _id: 'c3' }),
        ],
        pagination: { page: 1, limit: 15, total: 3, totalPages: 1 },
      });

      render(
        <MemoryRouter>
          <InfluencerCampaignDiscoveryPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Campaign Alpha')).toBeInTheDocument();
        expect(screen.getByText('Campaign Beta')).toBeInTheDocument();
        expect(screen.getByText('Campaign Gamma')).toBeInTheDocument();
      });
    });

    it('shows error message when fetching fails', async () => {
      vi.mocked(campaignService.getCampaigns).mockRejectedValue(new Error('Network error'));

      render(
        <MemoryRouter>
          <InfluencerCampaignDiscoveryPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('renders filter panel when Filters button clicked', async () => {
      vi.mocked(campaignService.getCampaigns).mockResolvedValue(emptyPaginatedResponse());

      render(
        <MemoryRouter>
          <InfluencerCampaignDiscoveryPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/No Campaigns Found/i)).toBeInTheDocument();
      });

      const filterBtn = screen.getByRole('button', { name: /Filters/i });
      fireEvent.click(filterBtn);

      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Platform/i)).toBeInTheDocument();
    });

    it('renders total campaign count in header', async () => {
      vi.mocked(campaignService.getCampaigns).mockResolvedValue({
        data: [buildCampaign()],
        pagination: { page: 1, limit: 15, total: 142, totalPages: 10 },
      });

      render(
        <MemoryRouter>
          <InfluencerCampaignDiscoveryPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('142')).toBeInTheDocument();
      });
    });
  });

  // ── Influencer Campaign Details Page ─────────────────────────────────────
  describe('InfluencerCampaignDetailsPage', () => {
    it('renders campaign title and description', async () => {
      vi.mocked(campaignService.getCampaignById).mockResolvedValue(buildCampaign());

      render(
        <MemoryRouter initialEntries={['/influencer/campaigns/camp-123']}>
          <Routes>
            <Route path="/influencer/campaigns/:id" element={<InfluencerCampaignDetailsPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Summer Luxury Reels Campaign')).toBeInTheDocument();
      });

      expect(screen.getByText(/Promote our summer collection/i)).toBeInTheDocument();
    });

    it('renders deliverables list', async () => {
      vi.mocked(campaignService.getCampaignById).mockResolvedValue(buildCampaign());

      render(
        <MemoryRouter initialEntries={['/influencer/campaigns/camp-123']}>
          <Routes>
            <Route path="/influencer/campaigns/:id" element={<InfluencerCampaignDetailsPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('3x Reels')).toBeInTheDocument();
        expect(screen.getByText('5x Stories')).toBeInTheDocument();
      });
    });

    it('shows Apply Now button for PUBLISHED campaigns', async () => {
      vi.mocked(campaignService.getCampaignById).mockResolvedValue(buildCampaign({ status: 'PUBLISHED' }));

      render(
        <MemoryRouter initialEntries={['/influencer/campaigns/camp-123']}>
          <Routes>
            <Route path="/influencer/campaigns/:id" element={<InfluencerCampaignDetailsPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Apply Now/i })).toBeInTheDocument();
      });
    });

    it('renders campaign snapshot details', async () => {
      vi.mocked(campaignService.getCampaignById).mockResolvedValue(buildCampaign());

      render(
        <MemoryRouter initialEntries={['/influencer/campaigns/camp-123']}>
          <Routes>
            <Route path="/influencer/campaigns/:id" element={<InfluencerCampaignDetailsPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/USD 5,000/i)).toBeInTheDocument();
      });

      expect(screen.getAllByText(/≥ 3.5%/i).length).toBeGreaterThan(0);
      expect(screen.getByText('Mumbai')).toBeInTheDocument();
    });

    it('shows error when campaign fails to load', async () => {
      vi.mocked(campaignService.getCampaignById).mockRejectedValue(new Error('Campaign not found.'));

      render(
        <MemoryRouter initialEntries={['/influencer/campaigns/bad-id']}>
          <Routes>
            <Route path="/influencer/campaigns/:id" element={<InfluencerCampaignDetailsPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Campaign not found/i)).toBeInTheDocument();
      });
    });
  });

  // ── Brand Campaign List Page ──────────────────────────────────────────────
  describe('BrandCampaignListPage', () => {
    it('renders the page header', async () => {
      vi.mocked(campaignService.getCampaigns).mockResolvedValue(emptyPaginatedResponse());

      render(
        <MemoryRouter>
          <BrandCampaignListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('My Campaigns')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /New Campaign/i })).toBeInTheDocument();
    });

    it('shows empty state when no campaigns', async () => {
      vi.mocked(campaignService.getCampaigns).mockResolvedValue(emptyPaginatedResponse());

      render(
        <MemoryRouter>
          <BrandCampaignListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/No Campaigns Found/i)).toBeInTheDocument();
      });
    });

    it('renders campaign list with title and status badge', async () => {
      vi.mocked(campaignService.getCampaigns).mockResolvedValue({
        data: [buildCampaign({ status: 'DRAFT' })],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      render(
        <MemoryRouter>
          <BrandCampaignListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Summer Luxury Reels Campaign')).toBeInTheDocument();
      });

      expect(screen.getAllByText('Draft').length).toBeGreaterThan(0);
    });

    it('shows Publish button for DRAFT campaigns', async () => {
      vi.mocked(campaignService.getCampaigns).mockResolvedValue({
        data: [buildCampaign({ status: 'DRAFT' })],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      render(
        <MemoryRouter>
          <BrandCampaignListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Publish/i })).toBeInTheDocument();
      });
    });

    it('shows error alert when list fetch fails', async () => {
      vi.mocked(campaignService.getCampaigns).mockRejectedValue(new Error('Server error'));

      render(
        <MemoryRouter>
          <BrandCampaignListPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Server error/i)).toBeInTheDocument();
      });
    });
  });

  // ── Brand Campaign Details Page ───────────────────────────────────────────
  describe('BrandCampaignDetailsPage', () => {
    it('renders campaign title, description, and budget', async () => {
      vi.mocked(campaignService.getCampaignById).mockResolvedValue(buildCampaign());

      render(
        <MemoryRouter initialEntries={['/brand/campaigns/camp-123']}>
          <Routes>
            <Route path="/brand/campaigns/:id" element={<BrandCampaignDetailsPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Summer Luxury Reels Campaign')).toBeInTheDocument();
      });

      expect(screen.getByText(/USD 5,000/i)).toBeInTheDocument();
      expect(screen.getByText(/Promote our summer collection/i)).toBeInTheDocument();
    });

    it('renders deliverables for brand', async () => {
      vi.mocked(campaignService.getCampaignById).mockResolvedValue(buildCampaign());

      render(
        <MemoryRouter initialEntries={['/brand/campaigns/camp-123']}>
          <Routes>
            <Route path="/brand/campaigns/:id" element={<BrandCampaignDetailsPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('3x Reels')).toBeInTheDocument();
      });

      expect(screen.getByText('5x Stories')).toBeInTheDocument();
    });

    it('shows DRAFT status badge and Publish button', async () => {
      vi.mocked(campaignService.getCampaignById).mockResolvedValue(buildCampaign({ status: 'DRAFT' }));

      render(
        <MemoryRouter initialEntries={['/brand/campaigns/camp-123']}>
          <Routes>
            <Route path="/brand/campaigns/:id" element={<BrandCampaignDetailsPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Draft')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Publish/i })).toBeInTheDocument();
      });
    });

    it('shows error when details fetch fails', async () => {
      vi.mocked(campaignService.getCampaignById).mockRejectedValue(new Error('Campaign fetch failed'));

      render(
        <MemoryRouter initialEntries={['/brand/campaigns/bad-id']}>
          <Routes>
            <Route path="/brand/campaigns/:id" element={<BrandCampaignDetailsPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Campaign fetch failed/i)).toBeInTheDocument();
      });
    });
  });
});
