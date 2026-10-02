import { Router, Request, Response } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Health check
router.use('/', healthRoutes);

// Auth routes
router.use('/auth', authRoutes);

// Helper for placeholder route handlers
const createPlaceholderRouter = (domain: string) => {
  const r = Router();
  r.get('/', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: `${domain} endpoint initialized (Phase 1 foundation)`
    });
  });
  return r;
};

// Mount all v1 routes
router.use('/users', createPlaceholderRouter('Users'));
router.use('/influencers', createPlaceholderRouter('Influencers'));
router.use('/brands', createPlaceholderRouter('Brands'));
router.use('/campaigns', createPlaceholderRouter('Campaigns'));
router.use('/applications', createPlaceholderRouter('Applications'));
router.use('/collaborations', createPlaceholderRouter('Collaborations'));
router.use('/messages', createPlaceholderRouter('Messages'));
router.use('/notifications', createPlaceholderRouter('Notifications'));
router.use('/analytics', createPlaceholderRouter('Analytics'));
router.use('/admin', authenticateToken, requireRole(UserRole.ADMIN), createPlaceholderRouter('Admin'));
router.use('/ai', createPlaceholderRouter('AI'));

export default router;
