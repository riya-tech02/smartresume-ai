import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ERROR_CODES } from '@smartresume/shared';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  const reqId = req.id || (req.headers['x-request-id'] as string) || 'unknown';

  // 1. AppError (our known domain errors)
  if (err instanceof AppError) {
    if (err.httpStatus >= 500) {
      logger.error({ reqId, err }, err.message);
    } else {
      logger.warn({ reqId, code: err.code, status: err.httpStatus }, err.message);
    }

    res.status(err.httpStatus).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId: reqId,
      },
    });
    return;
  }

  // 2. Zod validation error
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));

    logger.warn({ reqId, details }, 'Validation error');
    res.status(400).json({
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        details,
        requestId: reqId,
      },
    });
    return;
  }

  // 3. Mongoose duplicate key error (code 11000)
  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 11000) {
    const field = Object.keys((err as { keyPattern?: Record<string, number> }).keyPattern || {})[0] || 'field';
    const isEmail = field.toLowerCase().includes('email');
    const code = isEmail ? ERROR_CODES.EMAIL_TAKEN : ERROR_CODES.CONFLICT_REVISION;
    const message = isEmail ? 'An account with this email already exists' : `Duplicate value for ${field}`;

    logger.warn({ reqId, field }, message);
    res.status(409).json({
      error: {
        code,
        message,
        requestId: reqId,
      },
    });
    return;
  }

  // 4. Payload too large (express body-parser limit)
  if (typeof err === 'object' && err !== null && 'type' in err && (err as { type: string }).type === 'entity.too.large') {
    res.status(413).json({
      error: {
        code: ERROR_CODES.PAYLOAD_TOO_LARGE,
        message: 'Payload too large',
        requestId: reqId,
      },
    });
    return;
  }

  // 5. Unknown internal error
  logger.error({ reqId, err }, 'Unhandled internal server error');
  const message = env.NODE_ENV === 'development' && err instanceof Error ? err.message : 'An unexpected error occurred';

  res.status(500).json({
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message,
      requestId: reqId,
    },
  });
}
