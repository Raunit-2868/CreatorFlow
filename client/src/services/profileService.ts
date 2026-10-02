import { InfluencerProfile, BrandProfile } from '@/types';
import { authService } from './authService';

const INFLUENCER_API_BASE = '/api/v1/influencers';
const BRAND_API_BASE = '/api/v1/brands';

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

class ProfileService {
  // ================= Influencer Profile =================
  async getInfluencerMe(): Promise<InfluencerProfile | null> {
    const res = await fetch(`${INFLUENCER_API_BASE}/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (res.status === 404) {
      return null;
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch influencer profile');
    }
    return data.data;
  }

  async createInfluencerProfile(profile: Partial<InfluencerProfile>): Promise<InfluencerProfile> {
    const res = await fetch(`${INFLUENCER_API_BASE}/profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create influencer profile');
    }
    return data.data;
  }

  async updateInfluencerProfile(profile: Partial<InfluencerProfile>): Promise<InfluencerProfile> {
    const res = await fetch(`${INFLUENCER_API_BASE}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update influencer profile');
    }
    return data.data;
  }

  async getInfluencerById(id: string): Promise<InfluencerProfile> {
    const res = await fetch(`${INFLUENCER_API_BASE}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch influencer profile');
    }
    return data.data;
  }

  // ================= Brand Company Profile =================
  async getBrandMe(): Promise<BrandProfile | null> {
    const res = await fetch(`${BRAND_API_BASE}/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (res.status === 404) {
      return null;
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch brand profile');
    }
    return data.data;
  }

  async createBrandProfile(profile: Partial<BrandProfile>): Promise<BrandProfile> {
    const res = await fetch(`${BRAND_API_BASE}/profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create brand profile');
    }
    return data.data;
  }

  async updateBrandProfile(profile: Partial<BrandProfile>): Promise<BrandProfile> {
    const res = await fetch(`${BRAND_API_BASE}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update brand profile');
    }
    return data.data;
  }

  async getBrandById(id: string): Promise<BrandProfile> {
    const res = await fetch(`${BRAND_API_BASE}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch brand profile');
    }
    return data.data;
  }
}

export const profileService = new ProfileService();
