export type UserRole = 'INFLUENCER' | 'BRAND' | 'ADMIN';

export interface NavItem {
  label: string;
  href: string;
  icon: string; // Material symbol name
  badge?: string | number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ISocialPlatform {
  platform: string;
  handle: string;
  url?: string;
  followerCount: number;
  engagementRate: number;
}

export interface IAudienceDemographics {
  topLocations?: Array<{ location: string; percentage: number }>;
  ageGender?: Array<{ group: string; percentage: number }>;
  topInterests?: string[];
}

export interface IProfileService {
  name: string;
  description?: string;
  startingPrice: number;
  turnaroundDays?: number;
}

export interface IPortfolioItem {
  title: string;
  description?: string;
  mediaUrl: string;
  brandName?: string;
  campaignUrl?: string;
}

export interface InfluencerProfile {
  _id?: string;
  userId: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  niche: string[];
  socialPlatforms: ISocialPlatform[];
  totalFollowers: number;
  avgEngagementRate: number;
  audienceDemographics?: IAudienceDemographics;
  languages: string[];
  services: IProfileService[];
  pricing?: {
    startingRate?: number;
    currency?: string;
  };
  portfolio: IPortfolioItem[];
  completionPercentage: number;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandContact {
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface BrandProfile {
  _id?: string;
  userId: string;
  companyName: string;
  logo?: string;
  description?: string;
  industry?: string;
  website?: string;
  location?: string;
  companySize?: string;
  contactInformation?: BrandContact;
  tier?: string;
  completionPercentage: number;
  createdAt?: string;
  updatedAt?: string;
}


export type CampaignStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface FollowerRange {
  min?: number;
  max?: number | null;
}

export interface Campaign {
  _id?: string;
  brandId: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  currency?: string;
  targetAudience?: string;
  location?: string;
  requiredPlatform?: string;
  followerRange?: FollowerRange;
  engagementRequirement?: number;
  contentType?: string;
  deliverables?: string[];
  applicationDeadline?: string;
  campaignDeadline?: string;
  status: CampaignStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignFilters {
  search?: string;
  category?: string;
  platform?: string;
  location?: string;
  contentType?: string;
  status?: CampaignStatus;
  minBudget?: number;
  maxBudget?: number;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
  sortBy?: 'budget' | 'createdAt' | 'applicationDeadline' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
