import { Campaign, CampaignFilters, PaginatedResponse } from '@/types';
import { authService } from './authService';

const CAMPAIGN_API_BASE = '/api/v1/campaigns';

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getStoredToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const buildQueryString = (filters: CampaignFilters): string => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      params.set(key, String(val));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

class CampaignService {
  /** List campaigns with server-side filtering, search, sort, and pagination */
  async getCampaigns(filters: CampaignFilters = {}): Promise<PaginatedResponse<Campaign>> {
    const res = await fetch(`${CAMPAIGN_API_BASE}${buildQueryString(filters)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch campaigns');
    return { data: data.data, pagination: data.pagination };
  }

  /** Get a single campaign by ID */
  async getCampaignById(id: string): Promise<Campaign> {
    const res = await fetch(`${CAMPAIGN_API_BASE}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch campaign');
    return data.data;
  }

  /** Create a campaign (brand only) */
  async createCampaign(payload: Partial<Campaign>): Promise<Campaign> {
    const res = await fetch(CAMPAIGN_API_BASE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create campaign');
    return data.data;
  }

  /** Update an existing campaign (brand owner only) */
  async updateCampaign(id: string, payload: Partial<Campaign>): Promise<Campaign> {
    const res = await fetch(`${CAMPAIGN_API_BASE}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update campaign');
    return data.data;
  }

  /** Delete a campaign (brand owner only, DRAFT/CANCELLED) */
  async deleteCampaign(id: string): Promise<void> {
    const res = await fetch(`${CAMPAIGN_API_BASE}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete campaign');
  }

  /** Publish a DRAFT campaign */
  async publishCampaign(id: string): Promise<Campaign> {
    const res = await fetch(`${CAMPAIGN_API_BASE}/${id}/publish`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to publish campaign');
    return data.data;
  }

  /** Close a PUBLISHED campaign */
  async closeCampaign(id: string): Promise<Campaign> {
    const res = await fetch(`${CAMPAIGN_API_BASE}/${id}/close`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to close campaign');
    return data.data;
  }
}

export const campaignService = new CampaignService();
