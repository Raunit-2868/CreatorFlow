import mongoose, { Document, Schema } from 'mongoose';
import { IBrandProfile } from '../types/index.js';

export interface BrandProfileDocument extends Omit<IBrandProfile, '_id' | 'userId'>, Document {
  userId: mongoose.Types.ObjectId;
}

const ContactInfoSchema = new Schema(
  {
    contactName: { type: String, default: '', trim: true },
    contactEmail: { type: String, default: '', trim: true },
    contactPhone: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const BrandProfileSchema = new Schema<BrandProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    industry: {
      type: String,
      default: '',
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    companySize: {
      type: String,
      default: '11-50',
    },
    contactInformation: {
      type: ContactInfoSchema,
      default: () => ({ contactName: '', contactEmail: '', contactPhone: '' }),
    },
    tier: {
      type: String,
      default: 'Verified Brand',
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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
 * Calculate brand profile completion percentage based on filled fields.
 */
export const calculateBrandCompletion = (profile: any): number => {
  let score = 0;
  if (profile.companyName && profile.companyName.trim().length > 0) score += 15;
  if (profile.logo && profile.logo.trim().length > 0) score += 15;
  if (profile.description && profile.description.trim().length > 0) score += 15;
  if (profile.industry && profile.industry.trim().length > 0) score += 15;
  if (profile.website && profile.website.trim().length > 0) score += 15;
  if (profile.location && profile.location.trim().length > 0) score += 10;
  if (profile.companySize && profile.companySize.trim().length > 0) score += 5;
  if (profile.contactInformation?.contactEmail && profile.contactInformation.contactEmail.trim().length > 0) score += 10;
  return Math.min(100, score);
};

BrandProfileSchema.pre('save', function (next) {
  this.completionPercentage = calculateBrandCompletion(this);
  next();
});

export const BrandProfile = mongoose.model<BrandProfileDocument>('BrandProfile', BrandProfileSchema);
