import mongoose, { Document, Schema } from 'mongoose';
import { IApplication, ApplicationStatus } from '../types/index.js';

export interface ApplicationDocument extends Omit<IApplication, '_id' | 'campaignId' | 'influencerId'>, Document {
  campaignId: mongoose.Types.ObjectId;
  influencerId: mongoose.Types.ObjectId;
}

const ApplicationSchema = new Schema<ApplicationDocument>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: [true, 'Campaign ID is required'],
      index: true,
    },
    influencerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Influencer ID is required'],
      index: true,
    },
    proposal: {
      type: String,
      required: [true, 'Proposal message is required'],
      trim: true,
      minlength: [10, 'Proposal must be at least 10 characters long'],
      maxlength: [3000, 'Proposal cannot exceed 3000 characters'],
    },
    expectedCompensation: {
      type: Number,
      required: [true, 'Expected compensation is required'],
      min: [0, 'Expected compensation must be a non-negative number'],
    },
    contentApproach: {
      type: String,
      default: '',
      trim: true,
      maxlength: [3000, 'Content approach cannot exceed 3000 characters'],
    },
    portfolioLinks: {
      type: [String],
      default: [],
    },
    relevantPreviousWork: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Relevant previous work cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
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

// Compound unique index ensuring an influencer can only apply once to a campaign
ApplicationSchema.index({ campaignId: 1, influencerId: 1 }, { unique: true });

// Useful query indexes
ApplicationSchema.index({ influencerId: 1, status: 1, createdAt: -1 });
ApplicationSchema.index({ campaignId: 1, status: 1, createdAt: -1 });
ApplicationSchema.index({ status: 1, createdAt: -1 });

export const Application = mongoose.model<ApplicationDocument>('Application', ApplicationSchema);
