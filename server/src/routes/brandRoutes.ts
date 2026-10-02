import { Router } from 'express';
import {
  getBrandMe,
  createBrandProfile,
  updateBrandProfile,
  getBrandById,
} from '../controllers/brandController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Authenticated brand profile routes (ownership & role enforced)
router.get('/me', authenticateToken, requireRole(UserRole.BRAND), getBrandMe);
router.post('/profile', authenticateToken, requireRole(UserRole.BRAND), createBrandProfile);
router.put('/profile', authenticateToken, requireRole(UserRole.BRAND), updateBrandProfile);

// Public / Cross-role company profile view (Influencer or other users viewing Brand)
router.get('/:id', getBrandById);

export default router;
