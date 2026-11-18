import type { ResumeData, AtsCheck } from '@smartresume/shared';
import { TEMPLATES } from '@smartresume/shared';
import { estimatePages } from './pages.js';

export function runFormattingChecks(resume: ResumeData, now = new Date()): AtsCheck[] {
  const checks: AtsCheck[] = [];
  const visibleSections = (resume.sections || []).filter((s) => s.visible !== false);

  // F1: Email & phone present and valid
  const emailValid = Boolean(resume.personalInfo?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.personalInfo.email));
  const phoneValid = Boolean(resume.personalInfo?.phone && resume.personalInfo.phone.trim().length >= 7);
  const f1Passed = emailValid && phoneValid;
  checks.push({
    id: 'F1',
    category: 'formatting',
    label: 'Contact Information Presence',
    passed: f1Passed,
    score: f1Passed ? 1 : !emailValid && !phoneValid ? 0 : 0.5,
    detail: f1Passed
      ? 'Valid email and phone number are present.'
      : !emailValid && !phoneValid
      ? 'Both email and phone number are missing or invalid.'
      : !emailValid
      ? 'Email is missing or invalid.'
      : 'Phone number is missing or invalid.',
  });

  // F2: Standard section headings
  const standardHeadings = ['summary', 'education', 'skills', 'experience', 'internships', 'projects'];
  const hasStandardHeadings = visibleSections.some((s) => standardHeadings.includes(s.type));
  checks.push({
    id: 'F2',
    category: 'formatting',
    label: 'Standard Section Headings',
    passed: hasStandardHeadings,
    score: hasStandardHeadings ? 1 : 0,
    detail: hasStandardHeadings
      ? 'Uses recognizable standard ATS section titles.'
      : 'Missing recognizable standard section headings (Education, Experience, Skills).',
  });

  // F3: Template ATS safety
  const currentTemplate = TEMPLATES.find((t) => t.id === resume.templateId);
  const isAtsSafe = currentTemplate ? currentTemplate.atsSafe : true;
  checks.push({
    id: 'F3',
    category: 'formatting',
    label: 'ATS-Friendly Layout',
    passed: isAtsSafe,
    score: isAtsSafe ? 1 : 0.5,
    detail: isAtsSafe
      ? `Template "${currentTemplate?.name || resume.templateId}" is verified single-column ATS-safe.`
      : `Template "${currentTemplate?.name || resume.templateId}" has a two-column sidebar layout which can confuse older ATS parsers.`,
  });

  // F4: Page count estimation
  const estPages = estimatePages(resume);
  const hasContent = visibleSections.length > 0;
  const f4Passed = hasContent && estPages <= 2.2;
  checks.push({
    id: 'F4',
    category: 'formatting',
    label: 'Resume Length & Page Budget',
    passed: f4Passed,
    score: !hasContent ? 0 : f4Passed ? 1 : 0.5,
    detail: !hasContent
      ? 'No content to estimate page length.'
      : f4Passed
      ? `Estimated length is ~${estPages.toFixed(1)} page(s), within the recommended 1-2 page standard.`
      : `Estimated length is ~${estPages.toFixed(1)} pages. Resumes over 2 pages are frequently penalized by recruiters and ATS.`,
  });

  // F5: Dates present and consistent (YYYY-MM format)
  let missingDatesCount = 0;
  let totalEntriesWithDate = 0;
  for (const s of visibleSections) {
    if (['experience', 'internships', 'education', 'projects'].includes(s.type)) {
      const entries = (s.data as { entries?: Array<{ startDate?: string; endDate?: string; current?: boolean }> }).entries || [];
      for (const e of entries) {
        totalEntriesWithDate++;
        if (!e.startDate && !e.endDate) {
          missingDatesCount++;
        }
      }
    }
  }
  const f5Passed = totalEntriesWithDate > 0 && missingDatesCount === 0;
  checks.push({
    id: 'F5',
    category: 'formatting',
    label: 'Date Consistency',
    passed: f5Passed,
    score: totalEntriesWithDate === 0 ? 0 : f5Passed ? 1 : Math.max(0, 1 - missingDatesCount / totalEntriesWithDate),
    detail: totalEntriesWithDate === 0
      ? 'No dated entries found.'
      : f5Passed
      ? 'Dates are formatted consistently across entries.'
      : `${missingDatesCount} entry/entries are missing start or end dates.`,
  });

  // F6: Reverse-chronological order
  let isChronological = visibleSections.length > 0;
  let entriesChecked = 0;
  for (const s of visibleSections) {
    if (['experience', 'internships', 'education'].includes(s.type)) {
      const entries = (s.data as { entries?: Array<{ startDate?: string; endDate?: string }> }).entries || [];
      const dateList = entries.map((e) => e.endDate || e.startDate || '').filter(Boolean);
      entriesChecked += dateList.length;
      for (let i = 0; i < dateList.length - 1; i++) {
        const d1 = dateList[i]!;
        const d2 = dateList[i + 1]!;
        if (d1 < d2) {
          isChronological = false;
          break;
        }
      }
    }
  }
  const f6Passed = entriesChecked > 0 && isChronological;
  checks.push({
    id: 'F6',
    category: 'formatting',
    label: 'Reverse Chronological Order',
    passed: f6Passed,
    score: entriesChecked === 0 ? 0 : f6Passed ? 1 : 0.5,
    detail: entriesChecked === 0
      ? 'No dated experience or education entries found.'
      : f6Passed
      ? 'Entries are arranged in reverse chronological order (most recent first).'
      : 'Some entries are not in reverse-chronological order.',
  });

  // F7: No visible empty sections
  const emptySections = visibleSections.filter((s) => {
    const data = s.data as Record<string, unknown>;
    if (!data) return true;
    if (s.type === 'summary') return !data.text || String(data.text).trim().length === 0;
    if (s.type === 'skills') return !Array.isArray(data.groups) || data.groups.length === 0;
    if (Array.isArray(data.entries)) return data.entries.length === 0;
    return false;
  });
  const f7Passed = visibleSections.length > 0 && emptySections.length === 0;
  checks.push({
    id: 'F7',
    category: 'formatting',
    label: 'No Empty Sections',
    passed: f7Passed,
    score: visibleSections.length === 0 ? 0 : f7Passed ? 1 : 0.5,
    detail: visibleSections.length === 0
      ? 'No sections exist in this resume.'
      : f7Passed
      ? 'All visible sections have content.'
      : `${emptySections.length} visible section(s) have no content. Hide or populate them.`,
  });

  // F8: No emoji or all-caps paragraphs
  const allText = JSON.stringify(resume);
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const hasEmoji = emojiRegex.test(allText);
  const f8Passed = hasContent && !hasEmoji;
  checks.push({
    id: 'F8',
    category: 'formatting',
    label: 'Text Cleanliness (No Emoji / Corrupted Glyphs)',
    passed: f8Passed,
    score: !hasContent ? 0 : !hasEmoji ? 1 : 0.4,
    detail: !hasContent
      ? 'No content to analyze for special characters.'
      : !hasEmoji
      ? 'No emojis or incompatible glyphs detected.'
      : 'Emojis or unsupported special symbols detected. ATS parsers frequently corrupt these into gibberish.',
  });

  // F9: 2-6 bullets per experience/project entry
  let badBulletEntries = 0;
  let totalBulletEntries = 0;
  for (const s of visibleSections) {
    if (['experience', 'internships', 'projects'].includes(s.type)) {
      const entries = (s.data as { entries?: Array<{ bullets?: string[] }> }).entries || [];
      for (const e of entries) {
        totalBulletEntries++;
        const count = e.bullets?.length || 0;
        if (count < 2 || count > 6) {
          badBulletEntries++;
        }
      }
    }
  }
  const f9Passed = totalBulletEntries > 0 && badBulletEntries === 0;
  checks.push({
    id: 'F9',
    category: 'formatting',
    label: 'Bullet Count Per Entry (2-6 Bullets)',
    passed: f9Passed,
    score: totalBulletEntries === 0 ? 0 : f9Passed ? 1 : Math.max(0.3, 1 - badBulletEntries / totalBulletEntries),
    detail: totalBulletEntries === 0
      ? 'No experience or project entries found.'
      : f9Passed
      ? 'Experience and project entries have the ideal 2 to 6 bullet points each.'
      : `${badBulletEntries} entry/entries have fewer than 2 or more than 6 bullet points.`,
  });

  // F10: Valid URLs
  let invalidUrls = 0;
  const links = resume.personalInfo?.links || [];
  for (const link of links) {
    if (!link.url || !/^https?:\/\//i.test(link.url)) {
      invalidUrls++;
    }
  }
  const f10Passed = links.length > 0 && invalidUrls === 0;
  checks.push({
    id: 'F10',
    category: 'formatting',
    label: 'Valid Web Links',
    passed: f10Passed,
    score: links.length === 0 ? 0.3 : f10Passed ? 1 : 0.5,
    detail: links.length === 0
      ? 'No professional web links (LinkedIn, GitHub, Portfolio) provided.'
      : f10Passed
      ? 'All web links use valid https:// URLs.'
      : `${invalidUrls} link(s) lack a valid http:// or https:// protocol.`,
  });

  return checks;
}
