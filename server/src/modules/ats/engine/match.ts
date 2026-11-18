import { normalize, tokenize, stem } from './text.js';
import { getAliasMap } from './keywords.js';
import type { KeywordHit } from '@smartresume/shared';
import type { ResumeData, Section } from '@smartresume/shared';

/**
 * Flattens all visible content of a resume into plain text for ATS parsing
 */
export function flattenResumeToText(resume: Pick<ResumeData, 'personalInfo' | 'sections'>): string {
  const parts: string[] = [];

  // Personal Info
  if (resume.personalInfo) {
    parts.push(resume.personalInfo.fullName || '');
    parts.push(resume.personalInfo.headline || '');
    parts.push(resume.personalInfo.email || '');
    parts.push(resume.personalInfo.phone || '');
    parts.push(resume.personalInfo.location || '');
  }

  // Sections (visible only)
  const visible = (resume.sections || []).filter((s) => s.visible !== false);
  for (const sec of visible) {
    parts.push(sec.title);
    const data = sec.data as Record<string, unknown>;
    if (!data) continue;

    if (sec.type === 'summary' && typeof data.text === 'string') {
      parts.push(data.text);
    } else if (sec.type === 'skills' && Array.isArray(data.groups)) {
      for (const group of data.groups as Array<{ category: string; items: string[] }>) {
        parts.push(group.category || '');
        parts.push((group.items || []).join(' '));
      }
    } else if (Array.isArray(data.entries)) {
      for (const entry of data.entries as Array<Record<string, unknown>>) {
        if (entry.role) parts.push(String(entry.role));
        if (entry.organization) parts.push(String(entry.organization));
        if (entry.institution) parts.push(String(entry.institution));
        if (entry.degree) parts.push(String(entry.degree));
        if (entry.field) parts.push(String(entry.field));
        if (entry.name) parts.push(String(entry.name));
        if (entry.title) parts.push(String(entry.title));
        if (entry.description) parts.push(String(entry.description));
        if (Array.isArray(entry.techStack)) parts.push((entry.techStack as string[]).join(' '));
        if (Array.isArray(entry.bullets)) parts.push((entry.bullets as string[]).join(' '));
        if (Array.isArray(entry.details)) parts.push((entry.details as string[]).join(' '));
      }
    }
  }

  return parts.join(' ');
}

export interface MatchResult {
  matched: KeywordHit[];
  missing: KeywordHit[];
  keywordScore: number;
  skillsScore: number;
}

/**
 * Compares resume text against JD keywords
 */
export function matchKeywords(resumeText: string, keywords: KeywordHit[]): MatchResult {
  if (keywords.length === 0) {
    return { matched: [], missing: [], keywordScore: 100, skillsScore: 100 };
  }

  const normalizedResume = normalize(resumeText);
  const resumeTokens = tokenize(normalizedResume);
  const resumeTokenSet = new Set(resumeTokens);
  const stemmedResumeTokens = new Set(resumeTokens.map(stem));
  const aliasMap = getAliasMap();

  const matched: KeywordHit[] = [];
  const missing: KeywordHit[] = [];

  let totalWeight = 0;
  let matchedWeight = 0;

  let totalSkillWeight = 0;
  let matchedSkillWeight = 0;

  for (const kw of keywords) {
    totalWeight += kw.weight;
    if (kw.isSkill) {
      totalSkillWeight += kw.weight;
    }

    const termToMatch = (kw.canonical || kw.term).toLowerCase();
    let isFound = false;

    // Direct multi-word phrase test
    const escaped = termToMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const phraseRegex = new RegExp(`(?:^|\\s)${escaped}(?:\\s|$|[.,;])`, 'i');

    if (phraseRegex.test(normalizedResume)) {
      isFound = true;
    } else if (resumeTokenSet.has(termToMatch)) {
      isFound = true;
    } else if (stemmedResumeTokens.has(stem(termToMatch))) {
      isFound = true;
    } else {
      // Check if any alias of this term exists in resume
      for (const [alias, canon] of aliasMap.entries()) {
        if (canon === termToMatch) {
          const aliasEscaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const aliasRegex = new RegExp(`(?:^|\\s)${aliasEscaped}(?:\\s|$|[.,;])`, 'i');
          if (aliasRegex.test(normalizedResume) || resumeTokenSet.has(alias)) {
            isFound = true;
            break;
          }
        }
      }
    }

    if (isFound) {
      matched.push(kw);
      matchedWeight += kw.weight;
      if (kw.isSkill) {
        matchedSkillWeight += kw.weight;
      }
    } else {
      missing.push(kw);
    }
  }

  const keywordScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 100;
  const skillsScore = totalSkillWeight > 0 ? Math.round((matchedSkillWeight / totalSkillWeight) * 100) : 100;

  return {
    matched,
    missing,
    keywordScore,
    skillsScore,
  };
}
