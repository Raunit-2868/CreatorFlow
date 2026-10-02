import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Application } from '../models/Application.js';
import { Campaign } from '../models/Campaign.js';
import { InfluencerProfile } from '../models/InfluencerProfile.js';
import { BrandProfile } from '../models/BrandProfile.js';
import { ApplicationStatus, CampaignStatus, UserRole } from '../types/index.js';

/**
 * POST /api/v1/applications
 * Influencer submits an application to a published campaign.
 */
export const createApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Strict role check: Only INFLUENCER can apply
    if (userRole !== UserRole.INFLUENCER || !userId) {
      res.status(403).json({
        success: false,
        message: 'Only registered influencers can apply to campaigns.',
      });
      return;
    }

    const {
      campaignId,
      proposal,
      expectedCompensation,
      contentApproach,
      portfolioLinks,
      relevantPreviousWork,
    } = req.body;

    // Validate campaignId format
    if (!campaignId || !mongoose.Types.ObjectId.isValid(campaignId)) {
      res.status(400).json({
        success: false,
        message: 'A valid campaign ID is required.',
      });
      return;
    }

    // Validate proposal
    if (!proposal || typeof proposal !== 'string' || proposal.trim().length < 10) {
      res.status(400).json({
        success: false,
        message: 'Proposal message is required and must be at least 10 characters long.',
      });
      return;
    }

    if (proposal.trim().length > 3000) {
      res.status(400).json({
        success: false,
        message: 'Proposal cannot exceed 3000 characters.',
      });
      return;
    }

    // Validate expectedCompensation
    if (
      expectedCompensation === undefined ||
      expectedCompensation === null ||
      typeof expectedCompensation !== 'number' ||
      isNaN(expectedCompensation) ||
      expectedCompensation < 0
    ) {
      res.status(400).json({
        success: false,
        message: 'Expected compensation must be a non-negative number.',
      });
      return;
    }

    // Find the campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      res.status(404).json({
        success: false,
        message: 'Campaign not found.',
      });
      return;
    }

    // Ensure campaign is published
    if (campaign.status !== CampaignStatus.PUBLISHED) {
      res.status(400).json({
        success: false,
        message: 'Applications can only be submitted to published campaigns.',
      });
      return;
    }

    // Ensure deadline has not passed
    if (campaign.applicationDeadline && new Date() > new Date(campaign.applicationDeadline)) {
      res.status(400).json({
        success: false,
        message: 'Application deadline for this campaign has passed.',
      });
      return;
    }

    // Check for existing duplicate application
    const existingApplication = await Application.findOne({
      campaignId: campaign._id,
      influencerId: userId,
    });

    if (existingApplication) {
      res.status(409).json({
        success: false,
        message: 'You have already applied to this campaign.',
      });
      return;
    }

    // Create the application
    const newApplication = new Application({
      campaignId: campaign._id,
      influencerId: userId,
      proposal: proposal.trim(),
      expectedCompensation,
      contentApproach: typeof contentApproach === 'string' ? contentApproach.trim() : '',
      portfolioLinks: Array.isArray(portfolioLinks)
        ? portfolioLinks.filter((link) => typeof link === 'string' && link.trim().length > 0)
        : [],
      relevantPreviousWork:
        typeof relevantPreviousWork === 'string' ? relevantPreviousWork.trim() : '',
      status: ApplicationStatus.PENDING,
    });

    await newApplication.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: newApplication,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'You have already applied to this campaign.',
      });
      return;
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit application. Please try again later.',
    });
  }
};

/**
 * GET /api/v1/applications
 * List applications with role-based scoping and filtering.
 */
export const getApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { campaignId, status, page = '1', limit = '10' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = {};

    // Validate status filter if provided
    if (status) {
      if (!Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
        res.status(400).json({
          success: false,
          message: `Invalid status filter. Allowed values: ${Object.values(ApplicationStatus).join(', ')}`,
        });
        return;
      }
      filter.status = status;
    }

    // Role-based scoping
    if (userRole === UserRole.INFLUENCER) {
      // Influencers only see their own applications
      filter.influencerId = userId;

      if (campaignId) {
        if (!mongoose.Types.ObjectId.isValid(campaignId as string)) {
          res.status(400).json({ success: false, message: 'Invalid campaign ID format.' });
          return;
        }
        filter.campaignId = campaignId;
      }
    } else if (userRole === UserRole.BRAND) {
      if (campaignId) {
        if (!mongoose.Types.ObjectId.isValid(campaignId as string)) {
          res.status(400).json({ success: false, message: 'Invalid campaign ID format.' });
          return;
        }

        // Verify that the brand owns this campaign
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
          res.status(404).json({ success: false, message: 'Campaign not found.' });
          return;
        }

        if (campaign.brandId.toString() !== userId) {
          res.status(403).json({
            success: false,
            message: 'You do not have permission to view applications for this campaign.',
          });
          return;
        }

        filter.campaignId = campaignId;
      } else {
        // Find all campaigns owned by this brand
        const brandCampaigns = await Campaign.find({ brandId: userId }).select('_id');
        const campaignIds = brandCampaigns.map((c) => c._id);
        filter.campaignId = { $in: campaignIds };
      }
    } else if (userRole === UserRole.ADMIN) {
      if (campaignId) {
        if (!mongoose.Types.ObjectId.isValid(campaignId as string)) {
          res.status(400).json({ success: false, message: 'Invalid campaign ID format.' });
          return;
        }
        filter.campaignId = campaignId;
      }
    }

    const [applications, totalCount] = await Promise.all([
      Application.find(filter)
        .populate('campaignId', 'title category budget currency status brandId applicationDeadline deliverables requiredPlatform')
        .populate('influencerId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Application.countDocuments(filter),
    ]);

    // Enrich with Profiles
    const influencerIds = Array.from(
      new Set(
        applications.map((app: any) =>
          app.influencerId?._id ? app.influencerId._id.toString() : app.influencerId?.toString()
        )
      )
    ).filter(Boolean);

    const brandUserIds = Array.from(
      new Set(
        applications.map((app: any) =>
          app.campaignId?.brandId ? app.campaignId.brandId.toString() : null
        )
      )
    ).filter(Boolean);

    const [influencerProfiles, brandProfiles] = await Promise.all([
      InfluencerProfile.find({ userId: { $in: influencerIds } }).lean(),
      BrandProfile.find({ userId: { $in: brandUserIds } }).lean(),
    ]);

    const influencerProfileMap = new Map(
      influencerProfiles.map((p) => [p.userId.toString(), p])
    );
    const brandProfileMap = new Map(
      brandProfiles.map((p) => [p.userId.toString(), p])
    );

    const enrichedApplications = applications.map((app: any) => {
      const infId = app.influencerId?._id
        ? app.influencerId._id.toString()
        : app.influencerId?.toString();
      const bId = app.campaignId?.brandId ? app.campaignId.brandId.toString() : null;

      return {
        ...app,
        influencerProfile: infId ? influencerProfileMap.get(infId) || null : null,
        brandProfile: bId ? brandProfileMap.get(bId) || null : null,
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedApplications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (_error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications.',
    });
  }
};

/**
 * GET /api/v1/applications/:id
 * Retrieve a single application by ID with complete details and authorization checks.
 */
export const getApplicationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid application ID format.' });
      return;
    }

    const application = await Application.findById(id)
      .populate('campaignId')
      .populate('influencerId', 'name email role')
      .lean();

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    const campaign = application.campaignId as any;
    const appInfluencerId = application.influencerId?._id
      ? application.influencerId._id.toString()
      : application.influencerId?.toString();

    // Authorization check
    if (userRole === UserRole.INFLUENCER) {
      if (appInfluencerId !== userId) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to view this application.',
        });
        return;
      }
    } else if (userRole === UserRole.BRAND) {
      const campaignBrandId = campaign?.brandId ? campaign.brandId.toString() : '';
      if (campaignBrandId !== userId) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to view this application.',
        });
        return;
      }
    } else if (userRole !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this application.',
      });
      return;
    }

    // Attach creator and brand profile
    const [influencerProfile, brandProfile] = await Promise.all([
      appInfluencerId ? InfluencerProfile.findOne({ userId: appInfluencerId }).lean() : null,
      campaign?.brandId ? BrandProfile.findOne({ userId: campaign.brandId }).lean() : null,
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...application,
        influencerProfile,
        brandProfile,
      },
    });
  } catch (_error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve application details.',
    });
  }
};

/**
 * PATCH /api/v1/applications/:id/shortlist
 * Brand owner shortlists a pending application.
 */
export const shortlistApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid application ID format.' });
      return;
    }

    const application = await Application.findById(id).populate('campaignId');
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    const campaign = application.campaignId as any;
    if (userRole !== UserRole.ADMIN && campaign?.brandId?.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Only the campaign owner can shortlist applications.',
      });
      return;
    }

    if (application.status === ApplicationStatus.SHORTLISTED) {
      res.status(400).json({
        success: false,
        message: 'Application is already shortlisted.',
      });
      return;
    }

    if (application.status !== ApplicationStatus.PENDING) {
      res.status(400).json({
        success: false,
        message: `Cannot shortlist an application with status ${application.status}.`,
      });
      return;
    }

    application.status = ApplicationStatus.SHORTLISTED;
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application shortlisted successfully.',
      data: application,
    });
  } catch (_error) {
    res.status(500).json({
      success: false,
      message: 'Failed to shortlist application.',
    });
  }
};

/**
 * PATCH /api/v1/applications/:id/reject
 * Brand owner rejects an application.
 */
export const rejectApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid application ID format.' });
      return;
    }

    const application = await Application.findById(id).populate('campaignId');
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    const campaign = application.campaignId as any;
    if (userRole !== UserRole.ADMIN && campaign?.brandId?.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Only the campaign owner can reject applications.',
      });
      return;
    }

    if (application.status === ApplicationStatus.REJECTED) {
      res.status(400).json({
        success: false,
        message: 'Application is already rejected.',
      });
      return;
    }

    if (application.status === ApplicationStatus.ACCEPTED) {
      res.status(400).json({
        success: false,
        message: 'Cannot reject an already accepted application.',
      });
      return;
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
      res.status(400).json({
        success: false,
        message: 'Cannot reject a withdrawn application.',
      });
      return;
    }

    application.status = ApplicationStatus.REJECTED;
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application rejected.',
      data: application,
    });
  } catch (_error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject application.',
    });
  }
};

/**
 * PATCH /api/v1/applications/:id/accept
 * Brand owner accepts an application.
 */
export const acceptApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid application ID format.' });
      return;
    }

    const application = await Application.findById(id).populate('campaignId');
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    const campaign = application.campaignId as any;
    if (userRole !== UserRole.ADMIN && campaign?.brandId?.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Only the campaign owner can accept applications.',
      });
      return;
    }

    if (application.status === ApplicationStatus.ACCEPTED) {
      res.status(400).json({
        success: false,
        message: 'Application is already accepted.',
      });
      return;
    }

    if (application.status === ApplicationStatus.REJECTED) {
      res.status(400).json({
        success: false,
        message: 'Cannot accept a rejected application.',
      });
      return;
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
      res.status(400).json({
        success: false,
        message: 'Cannot accept a withdrawn application.',
      });
      return;
    }

    application.status = ApplicationStatus.ACCEPTED;
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application accepted successfully.',
      data: application,
    });
  } catch (_error) {
    res.status(500).json({
      success: false,
      message: 'Failed to accept application.',
    });
  }
};

/**
 * PATCH /api/v1/applications/:id/withdraw
 * Influencer withdraws their own application.
 */
export const withdrawApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid application ID format.' });
      return;
    }

    const application = await Application.findById(id);
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    // Must be the owner influencer or admin
    if (userRole !== UserRole.ADMIN && application.influencerId.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only withdraw your own applications.',
      });
      return;
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
      res.status(400).json({
        success: false,
        message: 'Application is already withdrawn.',
      });
      return;
    }

    if (application.status === ApplicationStatus.ACCEPTED) {
      res.status(400).json({
        success: false,
        message: 'Cannot withdraw an already accepted application.',
      });
      return;
    }

    if (application.status === ApplicationStatus.REJECTED) {
      res.status(400).json({
        success: false,
        message: 'Cannot withdraw a rejected application.',
      });
      return;
    }

    application.status = ApplicationStatus.WITHDRAWN;
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully.',
      data: application,
    });
  } catch (_error) {
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application.',
    });
  }
};
