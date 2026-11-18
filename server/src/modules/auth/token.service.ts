import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { Types } from 'mongoose';
import { env } from '../../config/env.js';
import { RefreshTokenModel } from './refreshToken.model.js';
import { sha256, generateRandomToken } from '../../utils/hash.js';
import { AppError } from '../../utils/AppError.js';
import { parseDurationToMs } from '../../utils/time.js';

export class TokenService {
  /**
   * Generates a short-lived access JWT (15m default)
   */
  static generateAccessToken(userId: string): string {
    return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
      algorithm: 'HS256',
      expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Creates and persists a new refresh token with rotation family
   */
  static async createRefreshToken(
    userId: string,
    userAgent = '',
    existingFamily?: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    const rawToken = generateRandomToken(48);
    const tokenHash = sha256(rawToken);
    const family = existingFamily || crypto.randomUUID();
    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    await RefreshTokenModel.create({
      userId: new Types.ObjectId(userId),
      family,
      tokenHash,
      usedAt: null,
      userAgent,
      expiresAt,
    });

    return { token: rawToken, expiresAt };
  }

  /**
   * Rotates a refresh token. Detects reuse and revokes the whole family if reused.
   */
  static async rotateRefreshToken(
    rawToken: string,
    userAgent = '',
  ): Promise<{ accessToken: string; newRefreshToken: string; expiresAt: Date; userId: string }> {
    const tokenHash = sha256(rawToken);
    const foundToken = await RefreshTokenModel.findOne({ tokenHash });

    if (!foundToken) {
      throw AppError.unauthenticated('Invalid refresh token');
    }

    // Check if token has expired
    if (foundToken.expiresAt < new Date()) {
      await RefreshTokenModel.deleteOne({ _id: foundToken._id });
      throw AppError.unauthenticated('Refresh token expired');
    }

    // Reuse detection: if token was already used, someone stole it! Revoke family.
    if (foundToken.usedAt !== null) {
      await RefreshTokenModel.deleteMany({ family: foundToken.family });
      throw AppError.unauthenticated('Token reuse detected. All sessions in this family revoked.');
    }

    // Mark current token as used
    foundToken.usedAt = new Date();
    await foundToken.save();

    // Create new token in the same family
    const userId = foundToken.userId.toString();
    const { token: newRefreshToken, expiresAt } = await this.createRefreshToken(
      userId,
      userAgent,
      foundToken.family,
    );

    const accessToken = this.generateAccessToken(userId);

    return {
      accessToken,
      newRefreshToken,
      expiresAt,
      userId,
    };
  }

  /**
   * Revokes a refresh token family (logout)
   */
  static async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = sha256(rawToken);
    const foundToken = await RefreshTokenModel.findOne({ tokenHash });
    if (foundToken) {
      await RefreshTokenModel.deleteMany({ family: foundToken.family });
    }
  }
}
