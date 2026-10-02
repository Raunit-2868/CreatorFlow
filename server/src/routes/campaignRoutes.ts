import { Router } from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  publishCampaign,
  closeCampaign,
} from '../controllers/campaignController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Brand-only: create campaign
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.BRAND),
  createCampaign
);

// List campaigns — authenticated users get role-appropriate results
// Unauthenticated GET also works (sees only PUBLISHED), but we attach user if present
router.get('/', (req, res, next) => {
  // Try to attach user from token if provided, but don't require it
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateToken(req, res, next);
  }
  next();
}, getCampaigns);

// Get single campaign
router.get('/:id', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateToken(req, res, next);
  }
  next();
}, getCampaignById);

// Brand-only: update
router.put(
  '/:id',
  authenticateToken,
  requireRole(UserRole.BRAND),
  updateCampaign
);

// Brand-only: delete
router.delete(
  '/:id',
  authenticateToken,
  requireRole(UserRole.BRAND),
  deleteCampaign
);

// Brand-only: convenience publish action
router.patch(
  '/:id/publish',
  authenticateToken,
  requireRole(UserRole.BRAND),
  publishCampaign
);

// Brand-only: convenience close action
router.patch(
  '/:id/close',
  authenticateToken,
  requireRole(UserRole.BRAND),
  closeCampaign
);

export default router;
