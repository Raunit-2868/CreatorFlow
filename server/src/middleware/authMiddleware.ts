import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokenUtils.js';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access token required. Please sign in.',
    });
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (_err) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired access token.',
    });
    return;
  }
};
