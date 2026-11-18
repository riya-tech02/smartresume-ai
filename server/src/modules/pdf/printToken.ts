import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';

const usedJtiTokens = new Set<string>();

interface PrintTokenPayload {
  sub: string;
  rid: string;
  aud: string;
  jti: string;
}

export class PrintTokenService {
  static signToken(userId: string, resumeId: string): string {
    const jti = crypto.randomUUID();
    return jwt.sign(
      {
        sub: userId,
        rid: resumeId,
        aud: 'print',
        jti,
      },
      env.PRINT_TOKEN_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '60s', // 60-second single-use token per ARCHITECTURE.md §11
      },
    );
  }

  static verifyAndConsumeToken(token: string): { userId: string; resumeId: string } {
    try {
      const decoded = jwt.verify(token, env.PRINT_TOKEN_SECRET, {
        algorithms: ['HS256'],
        audience: 'print',
      }) as PrintTokenPayload;

      // Single-use token enforcement
      if (usedJtiTokens.has(decoded.jti)) {
        throw AppError.unauthenticated('Print token has already been consumed');
      }

      usedJtiTokens.add(decoded.jti);
      // Clean up jti after 2 minutes
      setTimeout(() => usedJtiTokens.delete(decoded.jti), 2 * 60 * 1000);

      return {
        userId: decoded.sub,
        resumeId: decoded.rid,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw AppError.unauthenticated('Invalid or expired print token');
    }
  }
}
