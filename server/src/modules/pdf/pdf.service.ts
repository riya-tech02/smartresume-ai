import { Types } from 'mongoose';
import { ResumeModel } from '../resumes/resume.model.js';
import { PrintTokenService } from './printToken.js';
import { renderPdf } from './browserPool.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { sanitizeSlug } from '../../utils/slug.js';

export class PdfService {
  static async generateResumePdf(userId: string, resumeId: string): Promise<{ buffer: Buffer; filename: string }> {
    if (!Types.ObjectId.isValid(resumeId)) {
      throw AppError.notFound('Resume not found');
    }

    const resume = await ResumeModel.findOne({
      _id: new Types.ObjectId(resumeId),
      userId: new Types.ObjectId(userId),
    });

    if (!resume) {
      throw AppError.notFound('Resume not found');
    }

    // Generate single-use print token
    const printToken = PrintTokenService.signToken(userId, resumeId);
    const printUrl = `${env.CLIENT_URL}/print?token=${encodeURIComponent(printToken)}`;

    // Render PDF with headless Chromium
    const buffer = await renderPdf(printUrl);

    const nameSlug = sanitizeSlug(resume.personalInfo?.fullName || 'Candidate');
    const titleSlug = sanitizeSlug(resume.title || 'Resume');
    const filename = `${nameSlug}_${titleSlug}.pdf`;

    return { buffer, filename };
  }

  static async getResumeForPrintToken(token: string) {
    const { userId, resumeId } = PrintTokenService.verifyAndConsumeToken(token);

    const resume = await ResumeModel.findOne({
      _id: new Types.ObjectId(resumeId),
      userId: new Types.ObjectId(userId),
    });

    if (!resume) {
      throw AppError.notFound('Resume not found for print token');
    }

    return resume.toJSON();
  }
}
