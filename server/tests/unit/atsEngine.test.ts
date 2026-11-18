import { describe, it, expect } from 'vitest';
import { scoreResume } from '../../src/modules/ats/engine/scoreResume.js';
import { extractJdKeywords } from '../../src/modules/ats/engine/keywords.js';
import { matchKeywords, flattenResumeToText } from '../../src/modules/ats/engine/match.js';
import { normalize, tokenize, stem } from '../../src/modules/ats/engine/text.js';
import { estimatePages } from '../../src/modules/ats/engine/pages.js';
import { checkFacts } from '../../src/modules/ai/guards/factGuard.js';
import { sanitizeContext } from '../../src/modules/ai/guards/sanitizeContext.js';
import { SAMPLE_PERSONAL_INFO, SAMPLE_SECTIONS } from '../../src/modules/resumes/sample/sampleResume.js';
import type { ResumeData } from '@smartresume/shared';

const fixedDate = new Date('2026-01-15T12:00:00Z');

function createSampleResume(): ResumeData {
  return {
    id: 'res_sample_123',
    userId: 'user_456',
    title: 'Software Engineer Resume',
    templateId: 'software-engineer',
    settings: {
      accentColor: '#4F46E5',
      fontScale: 'md',
      spacing: 'normal',
    },
    personalInfo: SAMPLE_PERSONAL_INFO,
    sections: SAMPLE_SECTIONS,
    completion: 85,
    lastAtsScore: null,
    revision: 1,
    isSample: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('ATS Engine — Pure Functions & Checks', () => {
  it('normalizes text and preserves technical tokens like c++, node.js', () => {
    expect(normalize('Experienced in C++, Node.js, and React!'))
      .toBe('experienced in c++ node.js and react');
  });

  it('tokenizes text and filters stopwords when requested', () => {
    const tokens = tokenize('This is a software application for users', true);
    expect(tokens).toContain('software');
    expect(tokens).toContain('application');
    expect(tokens).toContain('users');
    expect(tokens).not.toContain('this');
    expect(tokens).not.toContain('is');
  });

  it('stems common English suffixes', () => {
    expect(stem('technologies')).toBe('technology');
    expect(stem('databases')).toBe('database');
    expect(stem('developed')).toBe('develop');
    expect(stem('engineering')).toBe('engineer');
  });

  it('extracts keywords and aliases from job description', () => {
    const jd = `We are looking for a Software Engineer proficient in React, JS, Node, and Mongo. Requirements: Must have 2+ years with Docker and REST APIs.`;
    const keywords = extractJdKeywords(jd);

    const canonicals = keywords.map((k) => k.canonical || k.term);
    expect(canonicals).toContain('react');
    expect(canonicals).toContain('javascript'); // alias of js
    expect(canonicals).toContain('node.js'); // alias of node
    expect(canonicals).toContain('mongodb'); // alias of mongo
    expect(canonicals).toContain('docker');
  });

  it('matches keywords and handles aliases in resume text', () => {
    const resumeText = 'Built web apps with JavaScript, Node.js, and MongoDB.';
    const keywords = [
      { term: 'js', canonical: 'javascript', weight: 2, isSkill: true },
      { term: 'node', canonical: 'node.js', weight: 2, isSkill: true },
      { term: 'python', canonical: 'python', weight: 2, isSkill: true },
    ];

    const matchRes = matchKeywords(resumeText, keywords);
    expect(matchRes.matched.map((m) => m.canonical)).toContain('javascript');
    expect(matchRes.matched.map((m) => m.canonical)).toContain('node.js');
    expect(matchRes.missing.map((m) => m.canonical)).toContain('python');
    expect(matchRes.keywordScore).toBe(67);
  });

  it('flattens visible resume sections to plain text', () => {
    const resume = createSampleResume();
    const text = flattenResumeToText(resume);
    expect(text).toContain('Aarav Mehta');
    expect(text).toContain('CampusHub');
    expect(text).toContain('TypeScript');
  });

  it('estimates page count reasonably', () => {
    const resume = createSampleResume();
    const pages = estimatePages(resume);
    expect(pages).toBeGreaterThanOrEqual(1.0);
    expect(pages).toBeLessThanOrEqual(2.5);
  });

  it('evaluates sample resume without JD to score >= 70 per PRD AC-ATS-2', () => {
    const resume = createSampleResume();
    const report = scoreResume(resume, undefined, fixedDate);

    expect(report.overall).toBeGreaterThanOrEqual(70);
    expect(report.scores.completeness).toBeGreaterThan(70);
    expect(report.scores.formatting).toBeGreaterThanOrEqual(70);
    expect(report.scores.content).toBeGreaterThanOrEqual(70);
    expect(report.scores.keyword).toBeNull();
    expect(report.hasJobDescription).toBe(false);
  });

  it('evaluates empty resume to score < 20 per PRD AC-ATS-2', () => {
    const emptyResume: ResumeData = {
      id: 'empty_1',
      userId: 'u1',
      title: 'Empty',
      templateId: 'minimal-ats',
      settings: { accentColor: '#4F46E5', fontScale: 'md', spacing: 'normal' },
      personalInfo: { fullName: '', headline: '', email: '', phone: '', location: '', links: [] },
      sections: [],
      completion: 0,
      lastAtsScore: null,
      revision: 1,
      isSample: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const report = scoreResume(emptyResume, undefined, fixedDate);
    expect(report.overall).toBeLessThan(20);
  });

  it('is completely deterministic: same input produces identical output', () => {
    const resume = createSampleResume();
    const jd = 'Looking for full stack developer with React, TypeScript, Node.js, and Docker.';

    const report1 = scoreResume(resume, jd, fixedDate);
    const report2 = scoreResume(resume, jd, fixedDate);

    expect(report1.overall).toEqual(report2.overall);
    expect(report1.scores).toEqual(report2.scores);
    expect(report1.checks.map((c) => c.passed)).toEqual(report2.checks.map((c) => c.passed));
  });

  it('weights change appropriately when JD is supplied vs omitted', () => {
    const resume = createSampleResume();
    const jd = 'We are seeking a talented full stack software engineer proficient in modern React, Node.js, and MongoDB architectures.';

    const reportWithJd = scoreResume(resume, jd, fixedDate);
    const reportWithoutJd = scoreResume(resume, undefined, fixedDate);

    expect(reportWithJd.weights.keyword).toBe(0.3);
    expect(reportWithoutJd.weights.keyword).toBe(0);
    expect(reportWithoutJd.weights.formatting).toBe(0.3);
    expect(reportWithoutJd.weights.content).toBe(0.4);
  });
});

describe('Fact Guard & PII Sanitizer', () => {
  it('detects unsupplied numbers and generates warnings', () => {
    const source = 'Built a campus web application for students';
    const suggestion = 'Engineered a campus web application serving 10,000 active students';

    const warnings = checkFacts(source, suggestion);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]?.value).toBe('10,000');
  });

  it('does not warn when number was already in source', () => {
    const source = 'Improved system latency by 45%';
    const suggestion = 'Architected optimized database pipeline, reducing latency by 45% [add metric]';

    const warnings = checkFacts(source, suggestion);
    expect(warnings.length).toBe(0);
  });

  it('does not warn for [add metric] placeholder', () => {
    const source = 'Built backend service';
    const suggestion = 'Engineered backend microservice handling [add metric] requests';

    const warnings = checkFacts(source, suggestion);
    expect(warnings.length).toBe(0);
  });

  it('sanitizes context by completely excluding email, phone, and URLs', () => {
    const pii = {
      fullName: 'Secret Aarav',
      headline: 'Tech Lead',
      email: 'secret.personal@private.com',
      phone: '+1 555 019 2834',
      location: '123 Private Street, Bangalore',
      links: [{ id: '1', label: 'GitHub', url: 'https://github.com/secret' }],
    };

    const sanitized = sanitizeContext(pii);
    expect(sanitized.headline).toBe('Tech Lead');
    expect((sanitized as any).email).toBeUndefined();
    expect((sanitized as any).phone).toBeUndefined();
    expect((sanitized as any).links).toBeUndefined();
    expect((sanitized as any).location).toBeUndefined();
  });
});
