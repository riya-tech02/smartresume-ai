import type { PersonalInfo, Section } from './schemas/section.js';

/**
 * Calculate resume completion percentage (0-100) per PRD §11.2
 *
 * Contact (name, email, phone, location present) = 15
 * Headline or summary = 10
 * Education ≥1 entry = 15
 * Skills ≥1 group with items = 15
 * Experience or Internships ≥1 entry = 15
 * Projects ≥1 entry = 15
 * ≥1 link (LinkedIn/GitHub/portfolio) = 5
 * ≥1 extra entry in Certifications/Achievements/Extracurricular/Languages/Custom = 10
 */
export function calculateCompleteness(
  personalInfo: PersonalInfo,
  sections: Section[],
): number {
  let score = 0;
  const visibleSections = sections.filter((s) => s.visible);

  // Contact: name, email, phone, location present (15 pts)
  const contactFields = [
    personalInfo.fullName,
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
  ].filter((f) => f && f.trim().length > 0);
  if (contactFields.length === 4) {
    score += 15;
  } else if (contactFields.length >= 2) {
    score += Math.round(15 * (contactFields.length / 4));
  }

  // Headline or summary (10 pts)
  const hasHeadline = personalInfo.headline && personalInfo.headline.trim().length > 0;
  const summarySection = visibleSections.find((s) => s.type === 'summary');
  const hasSummary = summarySection && summarySection.data && 'text' in summarySection.data && summarySection.data.text.trim().length > 0;
  if (hasHeadline || hasSummary) {
    score += 10;
  }

  // Education ≥1 entry (15 pts)
  const eduSection = visibleSections.find((s) => s.type === 'education');
  if (eduSection && 'entries' in eduSection.data && eduSection.data.entries.length > 0) {
    score += 15;
  }

  // Skills ≥1 group with items (15 pts)
  const skillsSection = visibleSections.find((s) => s.type === 'skills');
  if (
    skillsSection &&
    'groups' in skillsSection.data &&
    skillsSection.data.groups.some((g) => g.items.length > 0)
  ) {
    score += 15;
  }

  // Experience or Internships ≥1 entry (15 pts)
  const expSection = visibleSections.find((s) => s.type === 'experience');
  const internSection = visibleSections.find((s) => s.type === 'internships');
  const hasExp = expSection && 'entries' in expSection.data && expSection.data.entries.length > 0;
  const hasIntern = internSection && 'entries' in internSection.data && internSection.data.entries.length > 0;
  if (hasExp || hasIntern) {
    score += 15;
  }

  // Projects ≥1 entry (15 pts)
  const projSection = visibleSections.find((s) => s.type === 'projects');
  if (projSection && 'entries' in projSection.data && projSection.data.entries.length > 0) {
    score += 15;
  }

  // ≥1 link (5 pts)
  if (personalInfo.links && personalInfo.links.length > 0 && personalInfo.links.some((l) => l.url.trim().length > 0)) {
    score += 5;
  }

  // ≥1 extra entry in Certifications/Achievements/Extracurricular/Languages/Custom (10 pts)
  const extraTypes = ['certifications', 'achievements', 'extracurricular', 'languages', 'custom'] as const;
  const hasExtra = visibleSections.some((s) => {
    if (!extraTypes.includes(s.type as (typeof extraTypes)[number])) return false;
    if ('entries' in s.data) return s.data.entries.length > 0;
    return false;
  });
  if (hasExtra) {
    score += 10;
  }

  return Math.min(100, score);
}
