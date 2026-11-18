import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { ERROR_CODES } from '@smartresume/shared';

function createLimitHandler(message: string, code = ERROR_CODES.RATE_LIMITED) {
  return (req: Request, res: Response) => {
    res.status(429).json({
      error: {
        code,
        message,
        requestId: req.id || 'unknown',
      },
    });
  };
}

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createLimitHandler('Too many requests, please try again later.'),
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email ? String(req.body.email).toLowerCase() : '';
    return `${req.ip}_${email}`;
  },
  handler: createLimitHandler('Too many login attempts. Please try again after 15 minutes.'),
});

export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createLimitHandler('Too many session refresh requests.'),
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip || 'anonymous',
  handler: createLimitHandler('AI rate limit exceeded (max 10 requests per minute).', ERROR_CODES.RATE_LIMITED),
});

export const pdfRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip || 'anonymous',
  handler: createLimitHandler('PDF export rate limit exceeded (max 6 per minute).'),
});

export const atsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip || 'anonymous',
  handler: createLimitHandler('ATS analysis rate limit exceeded (max 30 per minute).'),
});
