import type { ResumeData } from '@smartresume/shared';

/**
 * Estimates number of printed A4 pages for a resume based on character count,
 * section density, and font scaling settings.
 */
export function estimatePages(resume: Pick<ResumeData, 'sections' | 'settings'>): number {
  let estimatedLines = 10; // Header & contact info takes approx 10 lines

  const fontScaleFactor =
    resume.settings?.fontScale === 'sm' ? 0.9 : resume.settings?.fontScale === 'lg' ? 1.15 : 1.0;
  const spacingFactor =
    resume.settings?.spacing === 'compact' ? 0.85 : resume.settings?.spacing === 'relaxed' ? 1.2 : 1.0;

  const visible = (resume.sections || []).filter((s) => s.visible !== false);

  for (const sec of visible) {
    estimatedLines += 3; // Section title & margin
    const data = sec.data as Record<string, unknown>;
    if (!data) continue;

    if (sec.type === 'summary' && typeof data.text === 'string') {
      estimatedLines += Math.ceil(data.text.length / 85);
    } else if (sec.type === 'skills' && Array.isArray(data.groups)) {
      estimatedLines += data.groups.length * 2;
    } else if (Array.isArray(data.entries)) {
      for (const entry of data.entries as Array<Record<string, unknown>>) {
        estimatedLines += 2; // entry header line + dates
        if (Array.isArray(entry.bullets)) {
          for (const b of entry.bullets as string[]) {
            estimatedLines += Math.max(1, Math.ceil(b.length / 80));
          }
        }
        if (Array.isArray(entry.details)) {
          for (const d of entry.details as string[]) {
            estimatedLines += Math.max(1, Math.ceil(d.length / 80));
          }
        }
      }
    }
  }

  const totalLines = estimatedLines * fontScaleFactor * spacingFactor;
  // A standard A4 page with 14mm margins holds ~48-52 lines of body text
  const pages = Math.max(1.0, Math.round((totalLines / 48) * 10) / 10);
  return pages;
}
