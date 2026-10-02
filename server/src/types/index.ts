export enum UserRole {
  INFLUENCER = 'INFLUENCER',
  BRAND = 'BRAND',
  ADMIN = 'ADMIN',
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp?: string;
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

export interface IInfluencerProfile {
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBrandContact {
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface IBrandProfile {
  _id?: string;
  userId: string;
  companyName: string;
  logo?: string;
  description?: string;
  industry?: string;
  website?: string;
  location?: string;
  companySize?: string;
  contactInformation?: IBrandContact;
  tier?: string;
  completionPercentage: number;
  createdAt?: Date;
  updatedAt?: Date;
}
