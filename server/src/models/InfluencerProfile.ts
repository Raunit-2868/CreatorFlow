import mongoose, { Document, Schema } from 'mongoose';
import { IInfluencerProfile } from '../types/index.js';

export interface InfluencerProfileDocument extends Omit<IInfluencerProfile, '_id' | 'userId'>, Document {
  userId: mongoose.Types.ObjectId;
}

const SocialPlatformSchema = new Schema(
  {
    platform: { type: String, required: true },
    handle: { type: String, required: true },
    url: { type: String, default: '' },
    followerCount: { type: Number, default: 0, min: 0 },
    engagementRate: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const AudienceDemographicsSchema = new Schema(
  {
    topLocations: [
      {
        location: { type: String },
        percentage: { type: Number, default: 0 },
      },
    ],
    ageGender: [
      {
        group: { type: String },
        percentage: { type: Number, default: 0 },
      },
    ],
    topInterests: [{ type: String }],
  },
  { _id: false }
);

const ProfileServiceSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    startingPrice: { type: Number, default: 0, min: 0 },
    turnaroundDays: { type: Number, default: 3, min: 1 },
  },
  { _id: false }
);

const PortfolioItemSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    mediaUrl: { type: String, required: true },
    brandName: { type: String, default: '' },
    campaignUrl: { type: String, default: '' },
  },
  { _id: false }
);

const InfluencerProfileSchema = new Schema<InfluencerProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    niche: {
      type: [String],
      default: [],
    },
    socialPlatforms: {
      type: [SocialPlatformSchema],
      default: [],
    },
    totalFollowers: {
      type: Number,
      default: 0,
      min: 0,
    },
    avgEngagementRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    audienceDemographics: {
      type: AudienceDemographicsSchema,
      default: () => ({ topLocations: [], ageGender: [], topInterests: [] }),
    },
    languages: {
      type: [String],
      default: [],
    },
    services: {
      type: [ProfileServiceSchema],
      default: [],
    },
    pricing: {
      startingRate: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    portfolio: {
      type: [PortfolioItemSchema],
      default: [],
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Calculate influencer profile completion percentage based on filled fields.
 */
export const calculateInfluencerCompletion = (profile: any): number => {
  let score = 0;
  if (profile.name && profile.name.trim().length > 0) score += 10;
  if (profile.bio && profile.bio.trim().length > 0) score += 10;
  if (profile.avatar && profile.avatar.trim().length > 0) score += 10;
  if (profile.location && profile.location.trim().length > 0) score += 10;
  if (profile.niche && profile.niche.length > 0) score += 15;
  if (profile.socialPlatforms && profile.socialPlatforms.length > 0) score += 15;
  if (profile.languages && profile.languages.length > 0) score += 10;
  if (profile.services && profile.services.length > 0) score += 10;
  if (profile.portfolio && profile.portfolio.length > 0) score += 10;
  return Math.min(100, score);
};

InfluencerProfileSchema.pre('save', function (next) {
  // Aggregate follower count and engagement rate
  if (this.socialPlatforms && this.socialPlatforms.length > 0) {
    this.totalFollowers = this.socialPlatforms.reduce((acc, sp) => acc + (sp.followerCount || 0), 0);
    const sumER = this.socialPlatforms.reduce((acc, sp) => acc + (sp.engagementRate || 0), 0);
    this.avgEngagementRate = parseFloat((sumER / this.socialPlatforms.length).toFixed(2));
  }
  this.completionPercentage = calculateInfluencerCompletion(this);
  next();
});

export const InfluencerProfile = mongoose.model<InfluencerProfileDocument>(
  'InfluencerProfile',
  InfluencerProfileSchema
);
