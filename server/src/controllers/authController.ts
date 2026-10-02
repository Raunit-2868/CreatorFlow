import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { UserRole, JwtPayload } from '../types/index.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../utils/tokenUtils.js';

/**
 * POST /api/v1/auth/register
 * Public registration restricted to INFLUENCER and BRAND roles.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.',
      });
      return;
    }

    // Enforce Rule: No public Admin registration
    if (role === UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        message: 'Public registration is not permitted for Admin accounts.',
      });
      return;
    }

    if (![UserRole.INFLUENCER, UserRole.BRAND].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either INFLUENCER or BRAND.',
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      isActive: true,
    });

    const jwtPayload: JwtPayload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user: newUser,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed due to server error.',
      error: (error as Error).message,
    });
  }
};

/**
 * POST /api/v1/auth/login
 * Authenticates user credentials and issues tokens.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const jwtPayload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Sign in successful.',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sign in failed due to server error.',
      error: (error as Error).message,
    });
  }
};

/**
 * POST /api/v1/auth/refresh
 * Exchanges a valid refresh token for a new access token.
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.body.refreshToken || req.headers['x-refresh-token'];

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required.',
      });
      return;
    }

    let decoded: JwtPayload;
    try {
      decoded = verifyRefreshToken(token);
    } catch (_err) {
      res.status(403).json({
        success: false,
        message: 'Invalid or expired refresh token.',
      });
      return;
    }

    const user = await User.findOne({ _id: decoded.userId, refreshToken: token });
    if (!user) {
      res.status(403).json({
        success: false,
        message: 'Refresh token not recognized or already revoked.',
      });
      return;
    }

    const jwtPayload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(jwtPayload);
    const newRefreshToken = generateRefreshToken(jwtPayload);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Token refresh failed.',
      error: (error as Error).message,
    });
  }
};

/**
 * POST /api/v1/auth/logout
 * Revokes refresh token and logs user out.
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    let userId = req.user?.userId;

    if (!userId && req.headers.authorization?.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = verifyAccessToken(token);
        userId = decoded.userId;
      } catch (_e) {
        // Ignore token verification errors during logout
      }
    }

    const bodyToken = req.body?.refreshToken;

    if (userId) {
      await User.findByIdAndUpdate(userId, { $set: { refreshToken: null } });
    } else if (bodyToken) {
      await User.findOneAndUpdate({ refreshToken: bodyToken }, { $set: { refreshToken: null } });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed.',
      error: (error as Error).message,
    });
  }
};

/**
 * GET /api/v1/auth/me
 * Retrieves authenticated user session profile.
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.',
      error: (error as Error).message,
    });
  }
};

/**
 * POST /api/v1/auth/forgot-password
 * Generates and records password reset token.
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return 200 to prevent email enumeration
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been dispatched.',
      });
      return;
    }

    // Generate token valid for 1 hour
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been dispatched.',
      // In development/test mode, expose the token so it can be verified easily
      ...(process.env.NODE_ENV !== 'production' && { resetToken }),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request.',
      error: (error as Error).message,
    });
  }
};

/**
 * POST /api/v1/auth/reset-password
 * Validates reset token and sets new password.
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Reset token and new password are required.',
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.',
      });
      return;
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined; // Revoke current sessions
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been successfully updated. You may now sign in with your new password.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset password.',
      error: (error as Error).message,
    });
  }
};
