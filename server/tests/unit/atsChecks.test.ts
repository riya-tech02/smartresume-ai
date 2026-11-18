import { describe, it, expect } from 'vitest';
import { runFormattingChecks } from '../../src/modules/ats/engine/formatting.js';
import { runContentChecks } from '../../src/modules/ats/engine/content.js';
import { SAMPLE_PERSONAL_INFO, SAMPLE_SECTIONS } from '../../src/modules/resumes/sample/sampleResume.js';
import type { ResumeData } from '@smartresume/shared';

function createBaseResume(): ResumeData {
  return {
    id: 'res_check_test',
    userId: 'user_check',
    title: 'Test Resume',
    templateId: 'minimal-ats',
    settings: { accentColor: '#4F46E5', fontScale: 'md', spacing: 'normal' },
    personalInfo: { ...SAMPLE_PERSONAL_INFO },
    sections: JSON.parse(JSON.stringify(SAMPLE_SECTIONS)),
    completion: 80,
    lastAtsScore: null,
    revision: 1,
    isSample: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('ATS Formatting Checks (F1 - F10)', () => {
  it('F1 fails when email is missing or malformed', () => {
    const resume = createBaseResume();
    resume.personalInfo.email = 'not-an-email';
    const checks = runFormattingChecks(resume);
    const f1 = checks.find((c) => c.id === 'F1');
    expect(f1?.passed).toBe(false);
  });

  it('F1 passes when valid email and phone are present', () => {
    const resume = createBaseResume();
    const checks = runFormattingChecks(resume);
    const f1 = checks.find((c) => c.id === 'F1');
    expect(f1?.passed).toBe(true);
  });

  it('F3 fails for modern-professional template (two-column sidebar not atsSafe)', () => {
    const resume = createBaseResume();
    resume.templateId = 'modern-professional';
    const checks = runFormattingChecks(resume);
    const f3 = checks.find((c) => c.id === 'F3');
    expect(f3?.passed).toBe(false);
  });

  it('F3 passes for software-engineer and minimal-ats templates', () => {
    const resume = createBaseResume();
    resume.templateId = 'software-engineer';
    const checks = runFormattingChecks(resume);
    expect(checks.find((c) => c.id === 'F3')?.passed).toBe(true);
  });

  it('F7 fails when a visible section has empty entries', () => {
    const resume = createBaseResume();
    resume.sections.push({
      id: 'sec_empty',
      type: 'projects',
      title: 'Empty Projects',
      visible: true,
      data: { entries: [] },
    });
    const checks = runFormattingChecks(resume);
    const f7 = checks.find((c) => c.id === 'F7');
    expect(f7?.passed).toBe(false);
  });

  it('F8 fails when emojis are present', () => {
    const resume = createBaseResume();
    resume.personalInfo.headline = 'Rockstar Developer 🚀🔥';
    const checks = runFormattingChecks(resume);
    const f8 = checks.find((c) => c.id === 'F8');
    expect(f8?.passed).toBe(false);
  });

  it('F10 fails when link has invalid protocol', () => {
    const resume = createBaseResume();
    resume.personalInfo.links = [{ id: '1', label: 'Website', url: 'javascript:void(0)' }];
    const checks = runFormattingChecks(resume);
    const f10 = checks.find((c) => c.id === 'F10');
    expect(f10?.passed).toBe(false);
  });
});

describe('ATS Content Checks (C1 - C9)', () => {
  it('C1 fails when bullets do not begin with action verbs', () => {
    const resume = createBaseResume();
    const exp = resume.sections.find((s) => s.type === 'experience');
    if (exp && 'entries' in exp.data) {
      exp.data.entries[0]!.bullets = [
        'A web application was worked on by me.',
        'Involved in daily meetings.',
        'Doing maintenance tasks.',
      ];
    }
    const checks = runContentChecks(resume);
    const c1 = checks.find((c) => c.id === 'C1');
    expect(c1?.passed).toBe(false);
  });

  it('C2 passes when >= 30% of bullets are quantified with numbers/metrics', () => {
    const resume = createBaseResume();
    const checks = runContentChecks(resume);
    const c2 = checks.find((c) => c.id === 'C2');
    expect(c2?.passed).toBe(true);
  });

  it('C4 fails when passive weak phrases are detected', () => {
    const resume = createBaseResume();
    const exp = resume.sections.find((s) => s.type === 'experience');
    if (exp && 'entries' in exp.data) {
      exp.data.entries[0]!.bullets = ['Responsible for managing user accounts and database backups.'];
    }
    const checks = runContentChecks(resume);
    const c4 = checks.find((c) => c.id === 'C4');
    expect(c4?.passed).toBe(false);
  });

  it('C5 fails when first-person pronouns (I, me, my) are present', () => {
    const resume = createBaseResume();
    const summary = resume.sections.find((s) => s.type === 'summary');
    if (summary && 'text' in summary.data) {
      summary.data.text = 'I am an energetic engineer looking for my next big challenge with our team.';
    }
    const checks = runContentChecks(resume);
    const c5 = checks.find((c) => c.id === 'C5');
    expect(c5?.passed).toBe(false);
  });

  it('C9 fails when corporate clichés are detected', () => {
    const resume = createBaseResume();
    const summary = resume.sections.find((s) => s.type === 'summary');
    if (summary && 'text' in summary.data) {
      summary.data.text = 'A hard-working team player and go-getter who thinks outside the box.';
    }
    const checks = runContentChecks(resume);
    const c9 = checks.find((c) => c.id === 'C9');
    expect(c9?.passed).toBe(false);
  });
});
