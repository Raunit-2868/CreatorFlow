import { Router } from 'express';
import {
  createApplication,
  getApplications,
  getApplicationById,
  shortlistApplication,
  rejectApplication,
  acceptApplication,
  withdrawApplication,
} from '../controllers/applicationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Apply to a campaign (Influencer only)
router.post('/', authenticateToken, requireRole(UserRole.INFLUENCER), createApplication);

// List applications with role-based scoping (Influencer gets own, Brand gets for owned campaigns, Admin gets all)
router.get('/', authenticateToken, getApplications);

// Get single application by ID
router.get('/:id', authenticateToken, getApplicationById);

// Brand status actions
router.patch('/:id/shortlist', authenticateToken, requireRole(UserRole.BRAND, UserRole.ADMIN), shortlistApplication);
router.patch('/:id/reject', authenticateToken, requireRole(UserRole.BRAND, UserRole.ADMIN), rejectApplication);
router.patch('/:id/accept', authenticateToken, requireRole(UserRole.BRAND, UserRole.ADMIN), acceptApplication);

// Influencer status action
router.patch('/:id/withdraw', authenticateToken, requireRole(UserRole.INFLUENCER, UserRole.ADMIN), withdrawApplication);

export default router;
