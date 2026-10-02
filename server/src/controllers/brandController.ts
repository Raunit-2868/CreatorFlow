import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BrandProfile, calculateBrandCompletion } from '../models/BrandProfile.js';
import { UserRole } from '../types/index.js';

/**
 * GET /api/v1/brands/me
 * Retrieves the authenticated brand's own company profile.
 */
export const getBrandMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const profile = await BrandProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Brand profile not found. Please create your company profile.',
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
      message: 'Failed to retrieve brand profile.',
      error: (error as Error).message,
    });
  }
};

/**
 * POST /api/v1/brands/profile
 * Creates a new company profile for the authenticated brand.
 */
export const createBrandProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.BRAND) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only brands can create a brand company profile.',
      });
      return;
    }

    const existingProfile = await BrandProfile.findOne({ userId });
    if (existingProfile) {
      res.status(409).json({
        success: false,
        message: 'Brand profile already exists for this user. Use PUT to update.',
      });
      return;
    }

    const {
      companyName,
      logo,
      description,
      industry,
      website,
      location,
      companySize,
      contactInformation,
      tier,
    } = req.body;

    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Company name is required.',
      });
      return;
    }

    const newProfile = new BrandProfile({
      userId,
      companyName: companyName.trim(),
      logo: logo || '',
      description: description || '',
      industry: industry || '',
      website: website || '',
      location: location || '',
      companySize: companySize || '11-50',
      contactInformation: contactInformation || { contactName: '', contactEmail: '', contactPhone: '' },
      tier: tier || 'Verified Brand',
    });

    await newProfile.save();

    res.status(201).json({
      success: true,
      message: 'Brand company profile created successfully.',
      data: newProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create brand profile.',
      error: (error as Error).message,
    });
  }
};

/**
 * PUT /api/v1/brands/profile
 * Updates the authenticated brand's own company profile (ownership enforced).
 */
export const updateBrandProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== UserRole.BRAND) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only brands can update a brand company profile.',
      });
      return;
    }

    const profile = await BrandProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Brand profile not found. Please create it first.',
      });
      return;
    }

    const {
      companyName,
      logo,
      description,
      industry,
      website,
      location,
      companySize,
      contactInformation,
      tier,
    } = req.body;

    if (companyName !== undefined) {
      if (typeof companyName !== 'string' || companyName.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Company name cannot be empty.' });
        return;
      }
      profile.companyName = companyName.trim();
    }

    if (logo !== undefined) profile.logo = logo;
    if (description !== undefined) profile.description = description;
    if (industry !== undefined) profile.industry = industry;
    if (website !== undefined) profile.website = website;
    if (location !== undefined) profile.location = location;
    if (companySize !== undefined) profile.companySize = companySize;
    if (contactInformation !== undefined) profile.contactInformation = contactInformation;
    if (tier !== undefined) profile.tier = tier;

    profile.completionPercentage = calculateBrandCompletion(profile.toObject());

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Brand profile updated successfully.',
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update brand profile.',
      error: (error as Error).message,
    });
  }
};

/**
 * GET /api/v1/brands/:id
 * Retrieves public company profile of a brand by Profile ID or User ID.
 * Accessible to Influencers, Admins, and other authenticated users.
 */
export const getBrandById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid profile or user ID format.',
      });
      return;
    }

    let profile = await BrandProfile.findById(id);
    if (!profile) {
      profile = await BrandProfile.findOne({ userId: id });
    }

    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Brand profile not found.',
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
      message: 'Failed to retrieve brand profile.',
      error: (error as Error).message,
    });
  }
};
