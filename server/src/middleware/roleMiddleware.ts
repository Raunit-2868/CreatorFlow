import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/index.js';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access forbidden: ${req.user.role} role is not permitted for this resource.`,
      });
      return;
    }

    next();
  };
};
