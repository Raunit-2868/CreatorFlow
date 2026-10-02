import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { InfluencerProfile, calculateInfluencerCompletion } from '../models/InfluencerProfile.js';
import { User } from '../models/User.js';
import { UserRole } from '../types/index.js';

/**
 * GET /api/v1/influencers/me
 * Retrieves the authenticated influencer's own profile.
 */
export const getInfluencerMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const profile = await InfluencerProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Influencer profile not found. Please create your profile.',
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve influencer profile.',
      error: (error as Error).message,
    });
  }
};

/**
 * POST /api/v1/influencers/profile
 * Creates a new profile for the authenticated influencer.
 */
export const createInfluencerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.INFLUENCER) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only influencers can create an influencer profile.',
      });
      return;
    }

    const existingProfile = await InfluencerProfile.findOne({ userId });
    if (existingProfile) {
      res.status(409).json({
        success: false,
        message: 'Influencer profile already exists for this user. Use PUT to update.',
      });
      return;
    }

    const {
      name,
      avatar,
      bio,
      location,
      niche,
      socialPlatforms,
      audienceDemographics,
      languages,
      services,
      pricing,
      portfolio,
      isPublic,
    } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Profile name is required.',
      });
      return;
    }

    // Validate social platforms structure if provided
    if (socialPlatforms && !Array.isArray(socialPlatforms)) {
      res.status(400).json({
        success: false,
        message: 'Social platforms must be an array.',
      });
      return;
    }

    const newProfile = new InfluencerProfile({
      userId,
      name: name.trim(),
      avatar: avatar || '',
      bio: bio || '',
      location: location || '',
      niche: Array.isArray(niche) ? niche : [],
      socialPlatforms: Array.isArray(socialPlatforms) ? socialPlatforms : [],
      audienceDemographics: audienceDemographics || { topLocations: [], ageGender: [], topInterests: [] },
      languages: Array.isArray(languages) ? languages : [],
      services: Array.isArray(services) ? services : [],
      pricing: pricing || { startingRate: 0, currency: 'USD' },
      portfolio: Array.isArray(portfolio) ? portfolio : [],
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    await newProfile.save();

    // Optionally keep user.name and user.avatar in sync
    if (avatar) {
      await User.findByIdAndUpdate(userId, { $set: { avatar, name: name.trim() } });
    }

    res.status(201).json({
      success: true,
      message: 'Influencer profile created successfully.',
      data: newProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create influencer profile.',
      error: (error as Error).message,
    });
  }
};

/**
 * PUT /api/v1/influencers/profile
 * Updates the authenticated influencer's own profile (ownership enforced).
 */
export const updateInfluencerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.INFLUENCER) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only influencers can update an influencer profile.',
      });
      return;
    }

    const profile = await InfluencerProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Influencer profile not found. Please create it first.',
      });
      return;
    }

    const {
      name,
      avatar,
      bio,
      location,
      niche,
      socialPlatforms,
      audienceDemographics,
      languages,
      services,
      pricing,
      portfolio,
      isPublic,
    } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Name cannot be empty.' });
        return;
      }
      profile.name = name.trim();
    }

    if (avatar !== undefined) profile.avatar = avatar;
    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location;
    if (niche !== undefined && Array.isArray(niche)) profile.niche = niche;
    if (socialPlatforms !== undefined && Array.isArray(socialPlatforms)) {
      profile.socialPlatforms = socialPlatforms;
      profile.totalFollowers = socialPlatforms.reduce((acc, sp) => acc + (sp.followerCount || 0), 0);
      const sumER = socialPlatforms.reduce((acc, sp) => acc + (sp.engagementRate || 0), 0);
      profile.avgEngagementRate = socialPlatforms.length > 0 ? parseFloat((sumER / socialPlatforms.length).toFixed(2)) : 0;
    }
    if (audienceDemographics !== undefined) profile.audienceDemographics = audienceDemographics;
    if (languages !== undefined && Array.isArray(languages)) profile.languages = languages;
    if (services !== undefined && Array.isArray(services)) profile.services = services;
    if (pricing !== undefined) profile.pricing = pricing;
    if (portfolio !== undefined && Array.isArray(portfolio)) profile.portfolio = portfolio;
    if (isPublic !== undefined) profile.isPublic = isPublic;

    profile.completionPercentage = calculateInfluencerCompletion(profile.toObject());

    await profile.save();

    // Sync User name / avatar
    if (name || avatar) {
      const updates: Record<string, string> = {};
      if (name) updates.name = name.trim();
      if (avatar) updates.avatar = avatar;
      await User.findByIdAndUpdate(userId, { $set: updates });
    }

    res.status(200).json({
      success: true,
      message: 'Influencer profile updated successfully.',
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update influencer profile.',
      error: (error as Error).message,
    });
  }
};

/**
 * GET /api/v1/influencers/:id
 * Retrieves public profile of an influencer by Profile ID or User ID.
 * Accessible to Brands, Admins, and other authenticated users.
 */
export const getInfluencerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid profile or user ID format.',
      });
      return;
    }

    // Try finding by Profile _id first, then fallback to userId
    let profile = await InfluencerProfile.findById(id);
    if (!profile) {
      profile = await InfluencerProfile.findOne({ userId: id });
    }

    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Influencer profile not found.',
      });
      return;
    }

    // If private and requester is not the owner
    const requesterId = req.user?.userId;
    if (!profile.isPublic && profile.userId.toString() !== requesterId) {
      res.status(404).json({
        success: false,
        message: 'Influencer profile not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve influencer profile.',
      error: (error as Error).message,
    });
  }
};
