import type { SectionType } from '../constants/sectionTypes.js';

export interface KeywordHit {
  term: string;
  canonical?: string;
  weight: number;
  isSkill?: boolean;
}

export interface AtsCheck {
  id: string;
  category: 'formatting' | 'content';
  label: string;
  passed: boolean;
  score: number;
  detail: string;
  locations?: { sectionId?: string; entryId?: string }[];
}

export interface Recommendation {
  id: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  message: string;
  fix?: string;
  location?: { sectionId?: string; entryId?: string };
}

export interface AtsReport {
  id: string;
  resumeId: string;
  createdAt: string;
  hasJobDescription: boolean;
  disclaimer: string;
  overall: number;
  scores: {
    keyword: number | null;
    skills: number | null;
    formatting: number;
    content: number;
    completeness: number;
  };
  weights: Record<'keyword' | 'skills' | 'formatting' | 'content' | 'completeness', number>;
  sectionsDetected: { type: SectionType; present: boolean; empty: boolean }[];
  missingSections: SectionType[];
  checks: AtsCheck[];
  keywords?: { matched: KeywordHit[]; missing: KeywordHit[] };
  skills?: { matched: string[]; missing: string[]; extra: string[] };
  recommendations: Recommendation[];
  estimatedPages: number;
}

export interface JobMatchResult {
  requirements: {
    skills: string[];
    keywords: string[];
    degree?: string;
    seniority?: string;
  };
  matched: string[];
  missing: { term: string; weight: number; suggestedSection: string }[];
  sectionSuggestions: { sectionType: string; message: string }[];
  ai: { used: boolean; suggestions?: unknown[] };
}

export const ATS_DISCLAIMER =
  'This is an estimated heuristic score to help you improve your resume. It is not a guarantee of passing any company\'s ATS.';
