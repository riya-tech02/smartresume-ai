import { Types } from 'mongoose';
import { UserModel } from './user.model.js';
import { ResumeModel } from '../resumes/resume.model.js';
import { RefreshTokenModel } from '../auth/refreshToken.model.js';
import { AnalysisModel } from '../ats/analysis.model.js';
import { AiUsageModel } from '../ai/usage.model.js';
import { comparePassword, hashPassword } from '../../utils/hash.js';
import { AppError } from '../../utils/AppError.js';
import type { UpdateProfileInput, ChangePasswordInput, DeleteAccountInput } from '@smartresume/shared';

export class UsersService {
  static async getMe(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw AppError.notFound('User not found');
    return user.toJSON();
  }

  static async updateMe(userId: string, input: UpdateProfileInput) {
    const user = await UserModel.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    if (input.name) {
      user.name = input.name.trim();
    }
    if (input.aiConsentAccepted !== undefined) {
      user.preferences.aiConsentAcceptedAt = input.aiConsentAccepted ? new Date() : null;
    }

    await user.save();
    return user.toJSON();
  }

  static async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await UserModel.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    const match = await comparePassword(input.currentPassword, user.passwordHash);
    if (!match) {
      throw AppError.badRequest('Current password does not match');
    }

    user.passwordHash = await hashPassword(input.newPassword);
    await user.save();

    // Revoke all existing refresh token sessions on password change
    await RefreshTokenModel.deleteMany({ userId: new Types.ObjectId(userId) });
  }

  static async deleteAccount(userId: string, input: DeleteAccountInput) {
    const user = await UserModel.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    const match = await comparePassword(input.password, user.passwordHash);
    if (!match) {
      throw AppError.badRequest('Invalid password');
    }

    const userObjId = new Types.ObjectId(userId);

    // Cascading deletes per ARCHITECTURE §16
    await ResumeModel.deleteMany({ userId: userObjId });
    await AnalysisModel.deleteMany({ userId: userObjId });
    await RefreshTokenModel.deleteMany({ userId: userObjId });
    await AiUsageModel.deleteMany({ userId: userObjId });
    await UserModel.deleteOne({ _id: userObjId });
  }

  static async exportData(userId: string) {
    const userObjId = new Types.ObjectId(userId);
    const user = await UserModel.findById(userObjId);
    if (!user) throw AppError.notFound('User not found');

    const resumes = await ResumeModel.find({ userId: userObjId }).lean();
    const analyses = await AnalysisModel.find({ userId: userObjId }).lean();

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        preferences: user.preferences,
      },
      resumes,
      analyses,
      exportedAt: new Date().toISOString(),
    };
  }
}
