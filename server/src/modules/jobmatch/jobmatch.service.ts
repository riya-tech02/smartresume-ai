import { Types } from 'mongoose';
import { ResumeModel } from '../resumes/resume.model.js';
import { AnalysisModel } from '../ats/analysis.model.js';
import { extractJdKeywords } from '../ats/engine/keywords.js';
import { flattenResumeToText, matchKeywords } from '../ats/engine/match.js';
import { sha256 } from '../../utils/hash.js';
import { AppError } from '../../utils/AppError.js';
import type { JobMatchInput, JobMatchResult } from '@smartresume/shared';

export class JobMatchService {
  static async match(userId: string, resumeId: string, input: JobMatchInput): Promise<JobMatchResult> {
    if (!Types.ObjectId.isValid(resumeId)) {
      throw AppError.notFound('Resume not found');
    }

    const resumeObjId = new Types.ObjectId(resumeId);
    const userObjId = new Types.ObjectId(userId);

    const resume = await ResumeModel.findOne({ _id: resumeObjId, userId: userObjId });
    if (!resume) {
      throw AppError.notFound('Resume not found');
    }

    // Extract requirements from JD
    const keywords = extractJdKeywords(input.jobDescription);
    const resumeText = flattenResumeToText(resume.toJSON() as any);
    const matchRes = matchKeywords(resumeText, keywords);

    const allSkills = keywords.filter((k) => k.isSkill).map((k) => k.canonical || k.term);
    const matchedSkills = matchRes.matched.filter((k) => k.isSkill).map((k) => k.canonical || k.term);
    const missingSkills = matchRes.missing.map((k) => ({
      term: k.canonical || k.term,
      weight: k.weight,
      suggestedSection: k.isSkill ? 'skills' : 'projects',
    }));

    // Generate rule-based section suggestions
    const sectionSuggestions: Array<{ sectionType: string; message: string }> = [];

    const topMissingSkills = missingSkills.filter((m) => m.suggestedSection === 'skills').slice(0, 5);
    if (topMissingSkills.length > 0) {
      const skillsStr = topMissingSkills.map((s) => s.term).join(', ');
      sectionSuggestions.push({
        sectionType: 'skills',
        message: `Add ${skillsStr} to Technical Skills if you have experience with them.`,
      });
    }

    const topMissingKeywords = missingSkills.filter((m) => m.suggestedSection === 'projects').slice(0, 3);
    for (const kw of topMissingKeywords) {
      sectionSuggestions.push({
        sectionType: 'projects',
        message: `Mention "${kw.term}" in your relevant project descriptions or experience bullets.`,
      });
    }

    // Degree / seniority hints from JD
    let degreeHint: string | undefined;
    let seniorityHint: string | undefined;

    const lowerJd = input.jobDescription.toLowerCase();
    if (lowerJd.includes('bachelor') || lowerJd.includes('b.tech') || lowerJd.includes('b.e.') || lowerJd.includes('bs')) {
      degreeHint = "Bachelor's Degree in Computer Science or related field";
    } else if (lowerJd.includes('master') || lowerJd.includes('m.tech') || lowerJd.includes('ms')) {
      degreeHint = "Master's Degree";
    }

    if (lowerJd.includes('intern') || lowerJd.includes('internship')) {
      seniorityHint = 'Internship';
    } else if (lowerJd.includes('junior') || lowerJd.includes('entry level') || lowerJd.includes('fresher') || lowerJd.includes('0-2 years')) {
      seniorityHint = 'Entry-Level / Fresher';
    } else if (lowerJd.includes('senior') || lowerJd.includes('5+ years') || lowerJd.includes('lead')) {
      seniorityHint = 'Senior Level';
    }

    const result: JobMatchResult = {
      requirements: {
        skills: allSkills,
        keywords: keywords.filter((k) => !k.isSkill).map((k) => k.term),
        degree: degreeHint,
        seniority: seniorityHint,
      },
      matched: matchedSkills,
      missing: missingSkills,
      sectionSuggestions,
      ai: { used: false },
    };

    // Save analysis (hash only, never store raw JD)
    const jdHash = sha256(input.jobDescription);
    await AnalysisModel.create({
      userId: userObjId,
      resumeId: resumeObjId,
      type: 'job-match',
      hasJobDescription: true,
      jobTitle: input.jobTitle || '',
      company: input.company || '',
      jobDescriptionHash: jdHash,
      result: result as unknown as Record<string, unknown>,
    });

    return result;
  }

  static async getLatest(userId: string, resumeId: string): Promise<JobMatchResult | null> {
    if (!Types.ObjectId.isValid(resumeId)) {
      throw AppError.notFound('Resume not found');
    }

    const resumeObjId = new Types.ObjectId(resumeId);
    const userObjId = new Types.ObjectId(userId);

    const latest = await AnalysisModel.findOne({
      resumeId: resumeObjId,
      userId: userObjId,
      type: 'job-match',
    }).sort({ createdAt: -1 });

    if (!latest) return null;
    return latest.result as unknown as JobMatchResult;
  }
}
