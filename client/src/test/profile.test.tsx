import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { InfluencerProfilePage } from '../pages/influencer/InfluencerProfilePage';
import { BrandProfilePage } from '../pages/brand/BrandProfilePage';
import { PublicInfluencerProfilePage } from '../pages/public/PublicInfluencerProfilePage';
import { PublicBrandProfilePage } from '../pages/public/PublicBrandProfilePage';
import { profileService } from '@/services/profileService';
import { InfluencerProfile, BrandProfile } from '../types';

const mockUser = {
  _id: 'user123',
  name: 'Elena Rostova',
  email: 'elena@example.com',
  role: 'INFLUENCER',
};

// Mock AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
  }),
}));

// Mock profileService
vi.mock('@/services/profileService', () => ({
  profileService: {
    getInfluencerMe: vi.fn(),
    createInfluencerProfile: vi.fn(),
    updateInfluencerProfile: vi.fn(),
    getInfluencerById: vi.fn(),
    getBrandMe: vi.fn(),
    createBrandProfile: vi.fn(),
    updateBrandProfile: vi.fn(),
    getBrandById: vi.fn(),
  },
}));

describe('Frontend Profiles UI & Flow Tests (Phase 3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Influencer Profile Page', () => {
    it('renders empty state when influencer profile does not exist yet', async () => {
      vi.mocked(profileService.getInfluencerMe).mockResolvedValue(null);

      render(
        <MemoryRouter>
          <InfluencerProfilePage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/No Creator Profile Found/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Create Creator Profile/i })).toBeInTheDocument();
    });

    it('renders influencer media kit with metrics and completion percentage', async () => {
      const mockProfile: InfluencerProfile = {
        _id: 'inf123',
        userId: 'user123',
        name: 'Elena Rostova',
        bio: 'Visual storyteller and luxury lifestyle creator.',
        location: 'Mumbai & Berlin',
        niche: ['Fashion & Lifestyle', 'Minimalist Aesthetics'],
        socialPlatforms: [
          { platform: 'Instagram', handle: '@elenarostova', followerCount: 185000, engagementRate: 5.2 },
        ],
        totalFollowers: 185000,
        avgEngagementRate: 5.2,
        languages: ['English', 'Hindi'],
        services: [
          { name: 'Dedicated Reel', startingPrice: 2000, turnaroundDays: 5 },
        ],
        portfolio: [
          { title: 'Silk Capsule', brandName: 'Nova', mediaUrl: 'https://example.com/img.jpg' },
        ],
        completionPercentage: 85,
        isPublic: true,
      };

      vi.mocked(profileService.getInfluencerMe).mockResolvedValue(mockProfile);

      render(
        <MemoryRouter>
          <InfluencerProfilePage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Elena Rostova').length).toBeGreaterThan(0);
        expect(screen.getByText(/Visual storyteller and luxury lifestyle creator/i)).toBeInTheDocument();
        expect(screen.getByText(/85%/i)).toBeInTheDocument();
        expect(screen.getByText('185,000')).toBeInTheDocument();
      });

      // Check tab switches
      const servicesTab = screen.getByRole('button', { name: /Services & Rates/i });
      fireEvent.click(servicesTab);
      expect(screen.getByText('Dedicated Reel')).toBeInTheDocument();
      expect(screen.getByText('$2,000')).toBeInTheDocument();
    });

    it('opens edit modal and allows saving updated profile', async () => {
      const mockProfile: InfluencerProfile = {
        _id: 'inf123',
        userId: 'user123',
        name: 'Elena Rostova',
        bio: 'Old Bio',
        location: 'Mumbai',
        niche: ['Fashion'],
        socialPlatforms: [],
        totalFollowers: 0,
        avgEngagementRate: 0,
        languages: ['English'],
        services: [],
        portfolio: [],
        completionPercentage: 50,
        isPublic: true,
      };

      vi.mocked(profileService.getInfluencerMe).mockResolvedValue(mockProfile);
      vi.mocked(profileService.updateInfluencerProfile).mockResolvedValue({
        ...mockProfile,
        bio: 'Updated Fresh Bio',
      });

      render(
        <MemoryRouter>
          <InfluencerProfilePage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Old Bio')).toBeInTheDocument();
      });

      // Click Edit Profile button
      const editBtn = screen.getByRole('button', { name: /Edit Profile/i });
      fireEvent.click(editBtn);

      // Verify modal is displayed
      expect(screen.getByText('Edit Creator Profile')).toBeInTheDocument();

      // Change bio
      const bioInput = screen.getByPlaceholderText(/Tell brands about your aesthetic/i);
      fireEvent.change(bioInput, { target: { value: 'Updated Fresh Bio' } });

      // Submit
      const saveBtn = screen.getByRole('button', { name: /Save Profile/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(profileService.updateInfluencerProfile).toHaveBeenCalled();
      });
    });
  });

  describe('Brand Profile Page', () => {
    it('renders empty state when brand company profile is missing', async () => {
      vi.mocked(profileService.getBrandMe).mockResolvedValue(null);

      render(
        <MemoryRouter>
          <BrandProfilePage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/No Company Profile Setup Yet/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Set Up Company Profile/i })).toBeInTheDocument();
    });

    it('renders brand identity, details, and verification badge', async () => {
      const mockBrand: BrandProfile = {
        _id: 'brand123',
        userId: 'branduser',
        companyName: 'Nova Collective',
        description: 'Sustainable luxury apparel and lifestyle label.',
        industry: 'Apparel & Fashion',
        website: 'https://novacollective.com',
        location: 'Mumbai & San Francisco',
        companySize: '51-200',
        contactInformation: {
          contactName: 'Sarah Jenkins',
          contactEmail: 'sarah@novacollective.com',
          contactPhone: '+1-555-0199',
        },
        tier: 'Verified Brand',
        completionPercentage: 100,
      };

      vi.mocked(profileService.getBrandMe).mockResolvedValue(mockBrand);

      render(
        <MemoryRouter>
          <BrandProfilePage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText(/Nova Collective/i).length).toBeGreaterThan(0);
      });
      expect(screen.getByText(/Sustainable luxury apparel/i)).toBeInTheDocument();
      expect(screen.getByText('novacollective.com')).toBeInTheDocument();
      expect(screen.getAllByText(/Apparel & Fashion/i).length).toBeGreaterThan(0);
      expect(screen.getByText('sarah@novacollective.com')).toBeInTheDocument();
    });
  });

  describe('Public Profile Views (Cross-Role Visibility)', () => {
    it('renders public influencer profile for brands to discover and invite', async () => {
      const mockPublicInfluencer: InfluencerProfile = {
        _id: 'inf456',
        userId: 'creator456',
        name: 'Aria Montgomery',
        bio: 'Design and architectural living creator.',
        location: 'Paris & Tokyo',
        niche: ['Architecture', 'Design'],
        socialPlatforms: [
          { platform: 'Instagram', handle: '@ariam', followerCount: 95000, engagementRate: 6.1 },
        ],
        totalFollowers: 95000,
        avgEngagementRate: 6.1,
        languages: ['English', 'French'],
        services: [
          { name: 'Sponsored Architecture Reel', startingPrice: 3200, turnaroundDays: 7 },
        ],
        portfolio: [],
        completionPercentage: 90,
        isPublic: true,
      };

      vi.mocked(profileService.getInfluencerById).mockResolvedValue(mockPublicInfluencer);

      render(
        <MemoryRouter initialEntries={['/influencers/inf456']}>
          <Routes>
            <Route path="/influencers/:id" element={<PublicInfluencerProfilePage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Aria Montgomery')).toBeInTheDocument();
        expect(screen.getByText(/Design and architectural living creator/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Invite to Campaign/i })).toBeInTheDocument();
      });
    });

    it('renders public brand profile for creators to inspect credentials', async () => {
      const mockPublicBrand: BrandProfile = {
        _id: 'brand789',
        userId: 'branduser789',
        companyName: 'Luxe Studio Co',
        description: 'Modern luxury accessories and apparel.',
        industry: 'Luxury Goods',
        website: 'https://luxestudio.com',
        location: 'London & Milan',
        companySize: '51-200',
        contactInformation: {
          contactEmail: 'collabs@luxestudio.com',
        },
        completionPercentage: 95,
      };

      vi.mocked(profileService.getBrandById).mockResolvedValue(mockPublicBrand);

      render(
        <MemoryRouter initialEntries={['/brands/brand789']}>
          <Routes>
            <Route path="/brands/:id" element={<PublicBrandProfilePage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Luxe Studio Co')).toBeInTheDocument();
        expect(screen.getByText(/Modern luxury accessories and apparel/i)).toBeInTheDocument();
        expect(screen.getByText(/luxestudio.com/i)).toBeInTheDocument();
      });
    });
  });
});
