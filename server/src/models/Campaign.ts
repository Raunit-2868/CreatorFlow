import mongoose, { Document, Schema } from 'mongoose';
import { ICampaign, CampaignStatus } from '../types/index.js';

export interface CampaignDocument extends Omit<ICampaign, '_id' | 'brandId'>, Document {
  brandId: mongoose.Types.ObjectId;
}

const FollowerRangeSchema = new Schema(
  {
    min: { type: Number, default: 0, min: 0 },
    max: { type: Number, default: null },
  },
  { _id: false }
);

const CampaignSchema = new Schema<CampaignDocument>(
  {
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Campaign description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Campaign category is required'],
      trim: true,
      index: true,
    },
    budget: {
      type: Number,
      required: [true, 'Campaign budget is required'],
      min: [0, 'Budget must be a positive number'],
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    targetAudience: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    requiredPlatform: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    followerRange: {
      type: FollowerRangeSchema,
      default: () => ({ min: 0, max: null }),
    },
    engagementRequirement: {
      type: Number,
      default: 0,
      min: 0,
    },
    contentType: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    deliverables: {
      type: [String],
      default: [],
    },
    applicationDeadline: {
      type: Date,
      default: null,
      index: true,
    },
    campaignDeadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(CampaignStatus),
      default: CampaignStatus.DRAFT,
      index: true,
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

// Compound index for the most common discovery query: published campaigns filtered/sorted
CampaignSchema.index({ status: 1, category: 1, createdAt: -1 });
CampaignSchema.index({ status: 1, requiredPlatform: 1, createdAt: -1 });
CampaignSchema.index({ status: 1, budget: -1 });

// Text search index
CampaignSchema.index({ title: 'text', description: 'text', category: 'text' });

export const Campaign = mongoose.model<CampaignDocument>('Campaign', CampaignSchema);
