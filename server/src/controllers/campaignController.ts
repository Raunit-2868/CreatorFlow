import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Campaign } from '../models/Campaign.js';
import { CampaignStatus, UserRole } from '../types/index.js';

/** Valid status transitions: fromStatus → allowed next statuses */
const ALLOWED_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  [CampaignStatus.DRAFT]: [CampaignStatus.PUBLISHED, CampaignStatus.CANCELLED],
  [CampaignStatus.PUBLISHED]: [CampaignStatus.CLOSED, CampaignStatus.IN_PROGRESS, CampaignStatus.CANCELLED],
  [CampaignStatus.CLOSED]: [CampaignStatus.IN_PROGRESS, CampaignStatus.CANCELLED],
  [CampaignStatus.IN_PROGRESS]: [CampaignStatus.COMPLETED, CampaignStatus.CANCELLED],
  [CampaignStatus.COMPLETED]: [],
  [CampaignStatus.CANCELLED]: [],
};

/**
 * POST /api/v1/campaigns
 * Creates a new campaign. Only authenticated BRAND users may create.
 */
export const createCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.BRAND) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only brands can create campaigns.',
      });
      return;
    }

    const {
      title,
      description,
      category,
      budget,
      currency,
      targetAudience,
      location,
      requiredPlatform,
      followerRange,
      engagementRequirement,
      contentType,
      deliverables,
      applicationDeadline,
      campaignDeadline,
      status,
    } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Campaign title is required.' });
      return;
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Campaign description is required.' });
      return;
    }
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Campaign category is required.' });
      return;
    }
    if (budget === undefined || budget === null || isNaN(Number(budget)) || Number(budget) < 0) {
      res.status(400).json({ success: false, message: 'Campaign budget must be a non-negative number.' });
      return;
    }

    // Only allow DRAFT or PUBLISHED as initial status
    const initialStatus = status === CampaignStatus.PUBLISHED ? CampaignStatus.PUBLISHED : CampaignStatus.DRAFT;

    const campaign = new Campaign({
      brandId: new mongoose.Types.ObjectId(userId),
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      budget: Number(budget),
      currency: currency || 'USD',
      targetAudience: targetAudience || '',
      location: location || '',
      requiredPlatform: requiredPlatform || '',
      followerRange: followerRange || { min: 0, max: null },
      engagementRequirement: Number(engagementRequirement) || 0,
      contentType: contentType || '',
      deliverables: Array.isArray(deliverables) ? deliverables : [],
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      campaignDeadline: campaignDeadline ? new Date(campaignDeadline) : null,
      status: initialStatus,
    });

    await campaign.save();

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully.',
      data: campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign.',
      error: (error as Error).message,
    });
  }
};

/**
 * GET /api/v1/campaigns
 * Lists campaigns with server-side filtering, search, sorting, and pagination.
 * - Brands see their own campaigns (all statuses).
 * - Influencers and unauthenticated users see only PUBLISHED campaigns.
 */
export const getCampaigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const skip = (page - 1) * limit;

    const {
      search,
      category,
      platform,
      location,
      contentType,
      status,
      minBudget,
      maxBudget,
      minFollowers,
      maxFollowers,
      minEngagement,
      sortBy,
      sortOrder,
    } = req.query as Record<string, string>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    // Role-based visibility
    if (userRole === UserRole.BRAND && userId) {
      // Brands see their own campaigns with optional status filter
      filter.brandId = new mongoose.Types.ObjectId(userId);
      if (status && Object.values(CampaignStatus).includes(status as CampaignStatus)) {
        filter.status = status;
      }
    } else {
      // Influencers / public → only published
      filter.status = CampaignStatus.PUBLISHED;
    }

    // Text search
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // Categorical filters
    if (category && category.trim()) {
      filter.category = { $regex: category.trim(), $options: 'i' };
    }
    if (platform && platform.trim()) {
      filter.requiredPlatform = { $regex: platform.trim(), $options: 'i' };
    }
    if (location && location.trim()) {
      filter.location = { $regex: location.trim(), $options: 'i' };
    }
    if (contentType && contentType.trim()) {
      filter.contentType = { $regex: contentType.trim(), $options: 'i' };
    }

    // Budget range
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget && !isNaN(Number(minBudget))) filter.budget.$gte = Number(minBudget);
      if (maxBudget && !isNaN(Number(maxBudget))) filter.budget.$lte = Number(maxBudget);
    }

    // Follower range
    if (minFollowers || maxFollowers) {
      if (minFollowers && !isNaN(Number(minFollowers))) {
        filter['followerRange.min'] = { $lte: Number(minFollowers) };
      }
      if (maxFollowers && !isNaN(Number(maxFollowers))) {
        const maxFol = Number(maxFollowers);
        filter.$or = [
          { 'followerRange.max': null },
          { 'followerRange.max': { $gte: maxFol } },
        ];
      }
    }

    // Engagement filter
    if (minEngagement && !isNaN(Number(minEngagement))) {
      filter.engagementRequirement = { $lte: Number(minEngagement) };
    }

    // Sorting
    const validSortFields = ['budget', 'createdAt', 'applicationDeadline', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Campaign.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaigns.',
      error: (error as Error).message,
    });
  }
};

/**
 * GET /api/v1/campaigns/:id
 * Returns a single campaign.
 * - Published campaigns are visible to all.
 * - Non-published campaigns are only visible to the owning brand.
 */
export const getCampaignById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid campaign ID format.' });
      return;
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found.' });
      return;
    }

    // Non-published campaigns visible only to owner
    if (campaign.status !== CampaignStatus.PUBLISHED) {
      const userId = req.user?.userId;
      if (!userId || campaign.brandId.toString() !== userId) {
        res.status(403).json({ success: false, message: 'You do not have permission to view this campaign.' });
        return;
      }
    }

    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaign.',
      error: (error as Error).message,
    });
  }
};

/**
 * PUT /api/v1/campaigns/:id
 * Updates campaign fields. Only the owning brand can update.
 * Handles status transitions with validation.
 */
export const updateCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.BRAND) {
      res.status(403).json({ success: false, message: 'Access denied: Only brands can update campaigns.' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid campaign ID format.' });
      return;
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found.' });
      return;
    }

    // Ownership check
    if (campaign.brandId.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Access denied: You do not own this campaign.' });
      return;
    }

    const {
      title,
      description,
      category,
      budget,
      currency,
      targetAudience,
      location,
      requiredPlatform,
      followerRange,
      engagementRequirement,
      contentType,
      deliverables,
      applicationDeadline,
      campaignDeadline,
      status,
    } = req.body;

    // Status transition validation
    if (status !== undefined) {
      if (!Object.values(CampaignStatus).includes(status as CampaignStatus)) {
        res.status(400).json({ success: false, message: `Invalid status value: ${status}` });
        return;
      }
      const currentStatus = campaign.status as CampaignStatus;
      const allowedNext = ALLOWED_TRANSITIONS[currentStatus];
      if (status !== currentStatus && !allowedNext.includes(status as CampaignStatus)) {
        res.status(422).json({
          success: false,
          message: `Invalid status transition: cannot move from '${currentStatus}' to '${status}'.`,
        });
        return;
      }
      campaign.status = status as CampaignStatus;
    }

    // Field validation for provided overrides
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Campaign title cannot be empty.' });
        return;
      }
      campaign.title = title.trim();
    }
    if (description !== undefined) campaign.description = description.trim();
    if (category !== undefined) campaign.category = category.trim();
    if (budget !== undefined) {
      if (isNaN(Number(budget)) || Number(budget) < 0) {
        res.status(400).json({ success: false, message: 'Budget must be a non-negative number.' });
        return;
      }
      campaign.budget = Number(budget);
    }
    if (currency !== undefined) campaign.currency = currency;
    if (targetAudience !== undefined) campaign.targetAudience = targetAudience;
    if (location !== undefined) campaign.location = location;
    if (requiredPlatform !== undefined) campaign.requiredPlatform = requiredPlatform;
    if (followerRange !== undefined) campaign.followerRange = followerRange;
    if (engagementRequirement !== undefined) campaign.engagementRequirement = Number(engagementRequirement);
    if (contentType !== undefined) campaign.contentType = contentType;
    if (deliverables !== undefined && Array.isArray(deliverables)) campaign.deliverables = deliverables;
    if (applicationDeadline !== undefined) campaign.applicationDeadline = applicationDeadline ? new Date(applicationDeadline) : undefined;
    if (campaignDeadline !== undefined) campaign.campaignDeadline = campaignDeadline ? new Date(campaignDeadline) : undefined;

    await campaign.save();

    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully.',
      data: campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign.',
      error: (error as Error).message,
    });
  }
};

/**
 * DELETE /api/v1/campaigns/:id
 * Deletes a campaign. Only the owning brand can delete DRAFT or CANCELLED campaigns.
 */
export const deleteCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.BRAND) {
      res.status(403).json({ success: false, message: 'Access denied: Only brands can delete campaigns.' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid campaign ID format.' });
      return;
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found.' });
      return;
    }

    if (campaign.brandId.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Access denied: You do not own this campaign.' });
      return;
    }

    // Prevent deletion of active campaigns
    const deletableStatuses: CampaignStatus[] = [CampaignStatus.DRAFT, CampaignStatus.CANCELLED];
    if (!deletableStatuses.includes(campaign.status as CampaignStatus)) {
      res.status(422).json({
        success: false,
        message: `Cannot delete a campaign in '${campaign.status}' status. Cancel it first.`,
      });
      return;
    }

    await campaign.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign.',
      error: (error as Error).message,
    });
  }
};

/**
 * PATCH /api/v1/campaigns/:id/publish
 * Convenience action to publish a DRAFT campaign.
 */
export const publishCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.BRAND) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid campaign ID format.' });
      return;
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found.' });
      return;
    }
    if (campaign.brandId.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Access denied: You do not own this campaign.' });
      return;
    }
    if (campaign.status !== CampaignStatus.DRAFT) {
      res.status(422).json({ success: false, message: `Only DRAFT campaigns can be published (current: ${campaign.status}).` });
      return;
    }

    campaign.status = CampaignStatus.PUBLISHED;
    await campaign.save();

    res.status(200).json({ success: true, message: 'Campaign published.', data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to publish campaign.', error: (error as Error).message });
  }
};

/**
 * PATCH /api/v1/campaigns/:id/close
 * Convenience action to close a PUBLISHED campaign.
 */
export const closeCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.BRAND) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid campaign ID format.' });
      return;
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found.' });
      return;
    }
    if (campaign.brandId.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Access denied: You do not own this campaign.' });
      return;
    }
    if (campaign.status !== CampaignStatus.PUBLISHED) {
      res.status(422).json({ success: false, message: `Only PUBLISHED campaigns can be closed (current: ${campaign.status}).` });
      return;
    }

    campaign.status = CampaignStatus.CLOSED;
    await campaign.save();

    res.status(200).json({ success: true, message: 'Campaign closed.', data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to close campaign.', error: (error as Error).message });
  }
};
