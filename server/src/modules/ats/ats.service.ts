import { Types } from 'mongoose';
import { ResumeModel } from '../resumes/resume.model.js';
import { AnalysisModel } from './analysis.model.js';
import { scoreResume } from './engine/scoreResume.js';
import { sha256 } from '../../utils/hash.js';
import { AppError } from '../../utils/AppError.js';
import type { AtsReport } from '@smartresume/shared';

export class AtsService {
  static async analyzeResume(userId: string, resumeId: string, jobDescription?: string): Promise<AtsReport> {
    if (!Types.ObjectId.isValid(resumeId)) {
      throw AppError.notFound('Resume not found');
    }

    const resumeObjId = new Types.ObjectId(resumeId);
    const userObjId = new Types.ObjectId(userId);

    const resume = await ResumeModel.findOne({ _id: resumeObjId, userId: userObjId });
    if (!resume) {
      throw AppError.notFound('Resume not found');
    }

    const report = scoreResume(resume.toJSON() as any, jobDescription);

    // Denormalize lastAtsScore onto resume per ARCHITECTURE.md §15
    resume.lastAtsScore = report.overall;
    await resume.save();

    const jdHash = jobDescription ? sha256(jobDescription) : undefined;

    // Persist analysis (raw JD is NOT stored for privacy, only hash)
    await AnalysisModel.create({
      userId: userObjId,
      resumeId: resumeObjId,
      type: 'ats',
      hasJobDescription: report.hasJobDescription,
      jobDescriptionHash: jdHash,
      overall: report.overall,
      result: report as unknown as Record<string, unknown>,
    });

    // Prune history: keep latest 10 per (resume, type) per ARCHITECTURE.md §15
    const analyses = await AnalysisModel.find({ resumeId: resumeObjId, type: 'ats' })
      .sort({ createdAt: -1 })
      .select('_id');

    if (analyses.length > 10) {
      const idsToDelete = analyses.slice(10).map((a) => a._id);
      await AnalysisModel.deleteMany({ _id: { $in: idsToDelete } });
    }

    return report;
  }

  static async getHistory(userId: string, resumeId: string) {
    if (!Types.ObjectId.isValid(resumeId)) {
      throw AppError.notFound('Resume not found');
    }

    const resumeObjId = new Types.ObjectId(resumeId);
    const userObjId = new Types.ObjectId(userId);

    const resume = await ResumeModel.findOne({ _id: resumeObjId, userId: userObjId });
    if (!resume) throw AppError.notFound('Resume not found');

    const analyses = await AnalysisModel.find({ resumeId: resumeObjId, type: 'ats' })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return analyses.map((a) => ({
      id: a._id.toString(),
      createdAt: a.createdAt.toISOString(),
      overall: a.overall,
      hasJobDescription: a.hasJobDescription,
      scores: (a.result as any)?.scores,
    }));
  }

  static async getAnalysis(userId: string, resumeId: string, analysisId: string) {
    if (!Types.ObjectId.isValid(resumeId) || !Types.ObjectId.isValid(analysisId)) {
      throw AppError.notFound('Analysis not found');
    }

    const analysis = await AnalysisModel.findOne({
      _id: new Types.ObjectId(analysisId),
      resumeId: new Types.ObjectId(resumeId),
      userId: new Types.ObjectId(userId),
    });

    if (!analysis) {
      throw AppError.notFound('Analysis not found');
    }

    return analysis.result;
  }
}
