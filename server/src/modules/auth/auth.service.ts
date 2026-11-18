import { Types } from 'mongoose';
import { UserModel, IUser } from '../users/user.model.js';
import { ResumeModel } from '../resumes/resume.model.js';
import { TokenService } from './token.service.js';
import { hashPassword, comparePassword, dummyPasswordCompare } from '../../utils/hash.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES, calculateCompleteness } from '@smartresume/shared';
import type { RegisterInput, LoginInput } from '@smartresume/shared';
import { SAMPLE_PERSONAL_INFO, SAMPLE_SECTIONS } from '../resumes/sample/sampleResume.js';

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    aiConsentAcceptedAt: Date | null;
  };
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export class AuthService {
  static async register(input: RegisterInput, userAgent = ''): Promise<AuthResult> {
    const emailLower = input.email.toLowerCase().trim();

    // Check if user already exists
    const existing = await UserModel.findOne({ emailLower });
    if (existing) {
      throw AppError.conflict(ERROR_CODES.EMAIL_TAKEN, 'An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await UserModel.create({
      name: input.name.trim(),
      email: input.email.trim(),
      emailLower,
      passwordHash,
      preferences: {
        aiConsentAcceptedAt: null,
      },
    });

    const userId = user._id.toString();

    // Create sample resume for the newly registered user (PRD RES-09)
    const completion = calculateCompleteness(SAMPLE_PERSONAL_INFO, SAMPLE_SECTIONS);
    await ResumeModel.create({
      userId: new Types.ObjectId(userId),
      title: 'Sample Software Engineer Resume',
      templateId: 'software-engineer',
      personalInfo: SAMPLE_PERSONAL_INFO,
      sections: SAMPLE_SECTIONS,
      completion,
      lastAtsScore: null,
      revision: 1,
      isSample: true,
    });

    const accessToken = TokenService.generateAccessToken(userId);
    const { token: refreshToken, expiresAt: refreshTokenExpiresAt } = await TokenService.createRefreshToken(
      userId,
      userAgent,
    );

    return {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        aiConsentAcceptedAt: user.preferences.aiConsentAcceptedAt,
      },
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    };
  }

  static async login(input: LoginInput, userAgent = ''): Promise<AuthResult> {
    const emailLower = input.email.toLowerCase().trim();
    const user = await UserModel.findOne({ emailLower });

    if (!user) {
      // Timing equalization against user enumeration
      await dummyPasswordCompare();
      throw AppError.invalidCredentials();
    }

    const match = await comparePassword(input.password, user.passwordHash);
    if (!match) {
      throw AppError.invalidCredentials();
    }

    const userId = user._id.toString();
    const accessToken = TokenService.generateAccessToken(userId);
    const { token: refreshToken, expiresAt: refreshTokenExpiresAt } = await TokenService.createRefreshToken(
      userId,
      userAgent,
    );

    return {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        aiConsentAcceptedAt: user.preferences.aiConsentAcceptedAt,
      },
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    };
  }

  static async refresh(rawToken: string, userAgent = ''): Promise<{ accessToken: string; newRefreshToken: string; expiresAt: Date; userId: string }> {
    return TokenService.rotateRefreshToken(rawToken, userAgent);
  }

  static async logout(rawToken: string): Promise<void> {
    await TokenService.revokeRefreshToken(rawToken);
  }
}
