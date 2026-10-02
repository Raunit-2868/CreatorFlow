import { Application, CreateApplicationDTO, ApplicationFilters, PaginatedResponse } from '@/types';
import { authService } from './authService';

const APPLICATION_API_BASE = '/api/v1/applications';

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getStoredToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const buildQueryString = (filters: ApplicationFilters): string => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      params.set(key, String(val));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

class ApplicationService {
  /** Submit an application to a published campaign */
  async createApplication(payload: CreateApplicationDTO): Promise<Application> {
    const res = await fetch(APPLICATION_API_BASE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit application');
    return data.data;
  }

  /** List applications with role scoping and filters */
  async getApplications(filters: ApplicationFilters = {}): Promise<PaginatedResponse<Application>> {
    const res = await fetch(`${APPLICATION_API_BASE}${buildQueryString(filters)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch applications');
    return { data: data.data, pagination: data.pagination };
  }

  /** Get a single application by ID */
  async getApplicationById(id: string): Promise<Application> {
    const res = await fetch(`${APPLICATION_API_BASE}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch application');
    return data.data;
  }

  /** Shortlist application (brand only) */
  async shortlistApplication(id: string): Promise<Application> {
    const res = await fetch(`${APPLICATION_API_BASE}/${id}/shortlist`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to shortlist application');
    return data.data;
  }

  /** Reject application (brand only) */
  async rejectApplication(id: string): Promise<Application> {
    const res = await fetch(`${APPLICATION_API_BASE}/${id}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reject application');
    return data.data;
  }

  /** Accept application (brand only) */
  async acceptApplication(id: string): Promise<Application> {
    const res = await fetch(`${APPLICATION_API_BASE}/${id}/accept`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to accept application');
    return data.data;
  }

  /** Withdraw application (influencer only) */
  async withdrawApplication(id: string): Promise<Application> {
    const res = await fetch(`${APPLICATION_API_BASE}/${id}/withdraw`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to withdraw application');
    return data.data;
  }
}

export const applicationService = new ApplicationService();
