import { Types } from 'mongoose';
import { AiUsageModel } from './usage.model.js';
import { UserModel } from '../users/user.model.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES } from '@smartresume/shared';

export class QuotaManager {
  static async checkConsent(userId: string): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) throw AppError.unauthenticated();

    // Check if consent has been given
    if (!user.preferences?.aiConsentAcceptedAt) {
      throw AppError.forbidden('AI data-use consent is required before accessing AI assistant features');
    }
  }

  static async getUsageStatus(userId: string): Promise<{ remainingToday: number; consentAccepted: boolean }> {
    const userObjId = new Types.ObjectId(userId);
    const user = await UserModel.findById(userObjId);
    const consentAccepted = Boolean(user?.preferences?.aiConsentAcceptedAt);

    // Count usage today (UTC day start)
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const count = await AiUsageModel.countDocuments({
      userId: userObjId,
      fallback: false,
      createdAt: { $gte: startOfDay },
    });

    const remaining = Math.max(0, env.AI_DAILY_LIMIT - count);
    return { remainingToday: remaining, consentAccepted };
  }

  static async checkAndRecordUsage(userId: string, feature: string, provider: string, isFallback: boolean): Promise<void> {
    const userObjId = new Types.ObjectId(userId);

    if (!isFallback) {
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);

      const count = await AiUsageModel.countDocuments({
        userId: userObjId,
        fallback: false,
        createdAt: { $gte: startOfDay },
      });

      if (count >= env.AI_DAILY_LIMIT) {
        throw AppError.tooManyRequests(`Daily AI request limit (${env.AI_DAILY_LIMIT}) exceeded. Try again tomorrow or use rule-based suggestions.`);
      }
    }

    // Record usage
    await AiUsageModel.create({
      userId: userObjId,
      feature,
      provider,
      fallback: isFallback,
      createdAt: new Date(),
    });
  }
}
