import { Router } from 'express';
import {
  getInfluencerMe,
  createInfluencerProfile,
  updateInfluencerProfile,
  getInfluencerById,
} from '../controllers/influencerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Authenticated influencer profile routes (ownership & role enforced)
router.get('/me', authenticateToken, requireRole(UserRole.INFLUENCER), getInfluencerMe);
router.post('/profile', authenticateToken, requireRole(UserRole.INFLUENCER), createInfluencerProfile);
router.put('/profile', authenticateToken, requireRole(UserRole.INFLUENCER), updateInfluencerProfile);

// Public / Cross-role profile view (Brand or other users viewing Influencer)
router.get('/:id', getInfluencerById);

export default router;
