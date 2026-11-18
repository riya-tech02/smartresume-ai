import { flattenResumeToText, matchKeywords } from './match.js';
import { extractJdKeywords } from './keywords.js';
import { runFormattingChecks } from './formatting.js';
import { runContentChecks } from './content.js';
import { estimatePages } from './pages.js';
import { buildRecommendations } from './recommendations.js';
import { calculateCompleteness, ATS_DISCLAIMER } from '@smartresume/shared';
import type { ResumeData, AtsReport, SectionType } from '@smartresume/shared';

export function scoreResume(
  resume: ResumeData,
  jobDescription?: string,
  now: Date = new Date(),
): AtsReport {
  const hasJobDescription = Boolean(jobDescription && jobDescription.trim().length >= 50);

  // 1. Completeness score
  const completeness = calculateCompleteness(resume.personalInfo, resume.sections);

  // 2. Sections detection
  const detectedTypes = new Set((resume.sections || []).filter((s) => s.visible !== false).map((s) => s.type));
  const coreExpected: SectionType[] = ['education', 'skills', 'experience', 'projects'];
  const missingSections: SectionType[] = coreExpected.filter((t) => !detectedTypes.has(t));

  const sectionsDetected = Array.from(detectedTypes).map((type) => {
    const sec = resume.sections.find((s) => s.type === type);
    let empty = true;
    if (sec && sec.data) {
      const d = sec.data as Record<string, unknown>;
      if (sec.type === 'summary' && typeof d.text === 'string') empty = d.text.trim().length === 0;
      else if (sec.type === 'skills' && Array.isArray(d.groups)) empty = d.groups.length === 0;
      else if (Array.isArray(d.entries)) empty = d.entries.length === 0;
    }
    return { type, present: true, empty };
  });

  // 3. Formatting and content checks
  const formattingChecks = runFormattingChecks(resume, now);
  const contentChecks = runContentChecks(resume);
  const allChecks = [...formattingChecks, ...contentChecks];

  const formattingScore = Math.round(
    (formattingChecks.reduce((sum, c) => sum + c.score, 0) / formattingChecks.length) * 100,
  );
  const contentScore = Math.round(
    (contentChecks.reduce((sum, c) => sum + c.score, 0) / contentChecks.length) * 100,
  );

  // 4. Job Description matching (if provided)
  let keywordScore: number | null = null;
  let skillsScore: number | null = null;
  let matchedKeywordsList = undefined;
  let missingKeywordsList = undefined;
  let matchedSkillsList: string[] = [];
  let missingSkillsList: string[] = [];

  const resumeText = flattenResumeToText(resume);

  if (hasJobDescription && jobDescription) {
    const jdKeywords = extractJdKeywords(jobDescription);
    const matchRes = matchKeywords(resumeText, jdKeywords);

    keywordScore = matchRes.keywordScore;
    skillsScore = matchRes.skillsScore;

    matchedKeywordsList = matchRes.matched;
    missingKeywordsList = matchRes.missing;

    matchedSkillsList = matchRes.matched.filter((k) => k.isSkill).map((k) => k.canonical || k.term);
    missingSkillsList = matchRes.missing.filter((k) => k.isSkill).map((k) => k.canonical || k.term);
  }

  // 5. Weighting per PRD §11.3
  let weights: AtsReport['weights'];
  let overall: number;

  if (hasJobDescription && keywordScore !== null && skillsScore !== null) {
    // With JD: Keyword 30% · Skills 15% · Formatting 20% · Content 20% · Completeness 15%
    weights = {
      keyword: 0.3,
      skills: 0.15,
      formatting: 0.2,
      content: 0.2,
      completeness: 0.15,
    };
    overall = Math.round(
      keywordScore * weights.keyword +
        skillsScore * weights.skills +
        formattingScore * weights.formatting +
        contentScore * weights.content +
        completeness * weights.completeness,
    );
  } else {
    // Without JD: Formatting 30% · Content 40% · Completeness 30%
    weights = {
      keyword: 0,
      skills: 0,
      formatting: 0.3,
      content: 0.4,
      completeness: 0.3,
    };
    overall = Math.round(
      formattingScore * weights.formatting +
        contentScore * weights.content +
        completeness * weights.completeness,
    );
  }

  // Bound overall score between 0 and 100
  overall = Math.max(0, Math.min(100, overall));

  // 6. Build recommendations
  const recommendations = buildRecommendations(allChecks, missingKeywordsList || [], missingSections, resume);
  const estimatedPages = estimatePages(resume);

  return {
    id: crypto.randomUUID(),
    resumeId: resume.id,
    createdAt: now.toISOString(),
    hasJobDescription,
    disclaimer: ATS_DISCLAIMER,
    overall,
    scores: {
      keyword: keywordScore,
      skills: skillsScore,
      formatting: formattingScore,
      content: contentScore,
      completeness,
    },
    weights,
    sectionsDetected,
    missingSections,
    checks: allChecks,
    keywords: hasJobDescription
      ? { matched: matchedKeywordsList || [], missing: missingKeywordsList || [] }
      : undefined,
    skills: hasJobDescription
      ? { matched: matchedSkillsList, missing: missingSkillsList, extra: [] }
      : undefined,
    recommendations,
    estimatedPages,
  };
}
