import { Types } from 'mongoose';
import { ResumeModel, IResume } from './resume.model.js';
import { AnalysisModel } from '../ats/analysis.model.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES, calculateCompleteness, LIMITS } from '@smartresume/shared';
import type {
  CreateResumeInput,
  UpdateResumeInput,
  ListResumesInput,
  DuplicateResumeInput,
} from '@smartresume/shared';
import { SAMPLE_PERSONAL_INFO, SAMPLE_SECTIONS } from './sample/sampleResume.js';

export class ResumesService {
  static async listResumes(userId: string, input?: Partial<ListResumesInput>) {
    const userObjId = new Types.ObjectId(userId);
    const filter: Record<string, unknown> = { userId: userObjId };

    if (input?.q && input.q.trim().length > 0) {
      filter.title = { $regex: input.q.trim(), $options: 'i' };
    }

    const sort = input?.sort || '-updatedAt';
    const page = input?.page || 1;
    const limit = input?.limit || 12;

    const sortOption: Record<string, 1 | -1> = {};
    if (sort.startsWith('-')) {
      sortOption[sort.substring(1)] = -1;
    } else {
      sortOption[sort] = 1;
    }

    const skip = (page - 1) * limit;

    // Use summary projection to optimize payload per ARCHITECTURE.md §7
    const [resumes, total] = await Promise.all([
      ResumeModel.find(filter)
        .select('_id title templateId completion lastAtsScore isSample updatedAt createdAt')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      ResumeModel.countDocuments(filter),
    ]);

    const formattedResumes = resumes.map((r) => ({
      id: r._id.toString(),
      title: r.title,
      templateId: r.templateId,
      completion: r.completion,
      lastAtsScore: r.lastAtsScore,
      isSample: r.isSample,
      updatedAt: r.updatedAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }));

    return {
      resumes: formattedResumes,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  static async createResume(userId: string, input: CreateResumeInput) {
    const userObjId = new Types.ObjectId(userId);

    // Enforce 20 resumes limit per user (PRD DASH-06)
    const count = await ResumeModel.countDocuments({ userId: userObjId });
    if (count >= LIMITS.RESUMES_PER_USER) {
      throw AppError.conflict(
        ERROR_CODES.RESUME_LIMIT_REACHED,
        `Maximum limit of ${LIMITS.RESUMES_PER_USER} resumes reached. Please delete an older resume to create a new one.`,
      );
    }

    const personalInfo = input.useSample
      ? SAMPLE_PERSONAL_INFO
      : { fullName: '', headline: '', email: '', phone: '', location: '', links: [] };

    const sections = input.useSample ? SAMPLE_SECTIONS : [];
    const completion = calculateCompleteness(personalInfo, sections);

    const resume = await ResumeModel.create({
      userId: userObjId,
      title: input.title.trim(),
      templateId: input.templateId,
      personalInfo,
      sections,
      completion,
      lastAtsScore: null,
      revision: 1,
      isSample: false,
    });

    return resume.toJSON();
  }

  static async getResume(userId: string, resumeId: string) {
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

    return resume.toJSON();
  }

  static async updateResume(userId: string, resumeId: string, input: UpdateResumeInput) {
    if (!Types.ObjectId.isValid(resumeId)) {
      throw AppError.notFound('Resume not found');
    }

    const resumeObjId = new Types.ObjectId(resumeId);
    const userObjId = new Types.ObjectId(userId);

    // Fetch existing resume to merge and calculate completion
    const existing = await ResumeModel.findOne({ _id: resumeObjId, userId: userObjId });
    if (!existing) {
      throw AppError.notFound('Resume not found');
    }

    const updateFields: Record<string, unknown> = {};
    if (input.title !== undefined) updateFields.title = input.title.trim();
    if (input.templateId !== undefined) updateFields.templateId = input.templateId;
    if (input.settings !== undefined) updateFields.settings = input.settings;
    if (input.personalInfo !== undefined) updateFields.personalInfo = input.personalInfo;
    if (input.sections !== undefined) updateFields.sections = input.sections;

    const finalPersonalInfo = input.personalInfo || existing.personalInfo;
    const finalSections = input.sections || existing.sections;
    updateFields.completion = calculateCompleteness(finalPersonalInfo, finalSections);

    // Atomic update with optimistic concurrency control per ARCHITECTURE.md §8 rule 4
    const updated = await ResumeModel.findOneAndUpdate(
      {
        _id: resumeObjId,
        userId: userObjId,
        revision: input.baseRevision,
      },
      {
        $set: updateFields,
        $inc: { revision: 1 },
      },
      { new: true },
    );

    if (!updated) {
      // Find current revision to give helpful conflict error
      const current = await ResumeModel.findOne({ _id: resumeObjId, userId: userObjId });
      if (!current) {
        throw AppError.notFound('Resume not found');
      }

      throw AppError.conflict(
        ERROR_CODES.CONFLICT_REVISION,
        'Resume was modified in another tab or session',
        { currentRevision: current.revision },
      );
    }

    return {
      id: updated._id.toString(),
      revision: updated.revision,
      completion: updated.completion,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  static async deleteResume(userId: string, resumeId: string) {
    if (!Types.ObjectId.isValid(resumeId)) {
      throw AppError.notFound('Resume not found');
    }

    const resumeObjId = new Types.ObjectId(resumeId);
    const userObjId = new Types.ObjectId(userId);

    const deleted = await ResumeModel.findOneAndDelete({
      _id: resumeObjId,
      userId: userObjId,
    });

    if (!deleted) {
      throw AppError.notFound('Resume not found');
    }

    // Cascade delete analyses for this resume
    await AnalysisModel.deleteMany({ resumeId: resumeObjId });
  }

  static async duplicateResume(userId: string, resumeId: string, input: DuplicateResumeInput) {
    if (!Types.ObjectId.isValid(resumeId)) {
      throw AppError.notFound('Resume not found');
    }

    const userObjId = new Types.ObjectId(userId);
    const count = await ResumeModel.countDocuments({ userId: userObjId });
    if (count >= LIMITS.RESUMES_PER_USER) {
      throw AppError.conflict(
        ERROR_CODES.RESUME_LIMIT_REACHED,
        `Maximum limit of ${LIMITS.RESUMES_PER_USER} resumes reached.`,
      );
    }

    const source = await ResumeModel.findOne({
      _id: new Types.ObjectId(resumeId),
      userId: userObjId,
    });

    if (!source) {
      throw AppError.notFound('Resume not found');
    }

    const newTitle = input.title?.trim() || `${source.title} (Copy)`;

    const duplicate = await ResumeModel.create({
      userId: userObjId,
      title: newTitle,
      templateId: source.templateId,
      settings: source.settings,
      personalInfo: source.personalInfo,
      sections: source.sections,
      completion: source.completion,
      lastAtsScore: null,
      revision: 1,
      isSample: false,
    });

    return duplicate.toJSON();
  }
}
