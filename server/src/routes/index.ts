import { Router, Request, Response } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import influencerRoutes from './influencerRoutes.js';
import brandRoutes from './brandRoutes.js';
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

// Profile routes
router.use('/influencers', influencerRoutes);
router.use('/brands', brandRoutes);
router.use('/campaigns', createPlaceholderRouter('Campaigns'));
router.use('/applications', createPlaceholderRouter('Applications'));
router.use('/collaborations', createPlaceholderRouter('Collaborations'));
router.use('/messages', createPlaceholderRouter('Messages'));
router.use('/notifications', createPlaceholderRouter('Notifications'));
router.use('/analytics', createPlaceholderRouter('Analytics'));
router.use('/admin', authenticateToken, requireRole(UserRole.ADMIN), createPlaceholderRouter('Admin'));
router.use('/ai', createPlaceholderRouter('AI'));

export default router;
