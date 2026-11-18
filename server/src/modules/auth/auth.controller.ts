import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { UserModel } from '../users/user.model.js';

const COOKIE_NAME = 'sr_refresh';

function setRefreshCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/api/v1/auth',
    expires: expiresAt,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/api/v1/auth',
  });
}

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const userAgent = req.headers['user-agent'] || '';
    const result = await AuthService.register(req.body, userAgent);

    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

    res.status(201).json({
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  }

  static async login(req: Request, res: Response): Promise<void> {
    const userAgent = req.headers['user-agent'] || '';
    const result = await AuthService.login(req.body, userAgent);

    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

    res.status(200).json({
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    const rawToken = req.cookies?.[COOKIE_NAME];
    if (!rawToken) {
      throw AppError.unauthenticated('Refresh token required');
    }

    const userAgent = req.headers['user-agent'] || '';
    const result = await AuthService.refresh(rawToken, userAgent);

    setRefreshCookie(res, result.newRefreshToken, result.expiresAt);

    // Fetch user details for client session restoration
    const user = await UserModel.findById(result.userId);

    res.status(200).json({
      data: {
        accessToken: result.accessToken,
        user: user
          ? {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              aiConsentAcceptedAt: user.preferences.aiConsentAcceptedAt,
            }
          : undefined,
      },
    });
  }

  static async logout(req: Request, res: Response): Promise<void> {
    const rawToken = req.cookies?.[COOKIE_NAME];
    if (rawToken) {
      await AuthService.logout(rawToken);
    }

    clearRefreshCookie(res);

    res.status(200).json({
      data: {
        message: 'Logged out successfully',
      },
    });
  }
}
