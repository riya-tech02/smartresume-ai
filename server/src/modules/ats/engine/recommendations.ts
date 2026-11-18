import type { AtsCheck, Recommendation, KeywordHit, ResumeData } from '@smartresume/shared';

export function buildRecommendations(
  checks: AtsCheck[],
  missingKeywords: KeywordHit[] = [],
  missingSections: string[] = [],
  resume: ResumeData,
): Recommendation[] {
  const recs: Recommendation[] = [];

  // 1. Missing sections
  for (const ms of missingSections) {
    if (ms === 'skills') {
      recs.push({
        id: 'rec_missing_skills',
        severity: 'high',
        category: 'completeness',
        message: 'Add a Technical Skills section with categorized programming languages and frameworks.',
        fix: 'Go to section list and enable or add "Technical Skills".',
      });
    } else if (ms === 'education') {
      recs.push({
        id: 'rec_missing_education',
        severity: 'high',
        category: 'completeness',
        message: 'Education section is missing. Recruiters prioritize degree and coursework information.',
        fix: 'Add your degree, institution name, graduation date, and CGPA.',
      });
    } else if (ms === 'projects' || ms === 'experience') {
      recs.push({
        id: 'rec_missing_experience',
        severity: 'high',
        category: 'completeness',
        message: 'Add Projects or Work Experience demonstrating hands-on technical competence.',
        fix: 'Add at least 2 detailed projects or past internship experiences.',
      });
    }
  }

  // 2. Failed formatting / content checks
  for (const c of checks) {
    if (!c.passed) {
      if (c.id === 'F1') {
        recs.push({
          id: 'rec_f1',
          severity: 'high',
          category: 'formatting',
          message: 'Provide a valid email address and phone number in your contact header.',
          fix: 'Edit your Personal Information block at the top of the resume.',
        });
      } else if (c.id === 'C2') {
        recs.push({
          id: 'rec_c2',
          severity: 'medium',
          category: 'content',
          message: 'Quantify your impact in bullet points (e.g. "improved latency by 35%", "served 10k users").',
          fix: 'Use the ✨ AI bullet enhancer to add measurable outcomes.',
        });
      } else if (c.id === 'C1') {
        recs.push({
          id: 'rec_c1',
          severity: 'medium',
          category: 'content',
          message: 'Start bullet points with powerful past-tense action verbs (e.g. "Engineered", "Architected").',
          fix: 'Replace passive or vague openings with action verbs.',
        });
      } else if (c.id === 'C4') {
        recs.push({
          id: 'rec_c4',
          severity: 'medium',
          category: 'content',
          message: 'Eliminate weak phrases such as "responsible for" or "worked on".',
          fix: 'State what you accomplished directly instead of listing responsibilities.',
        });
      } else if (c.id === 'C8') {
        recs.push({
          id: 'rec_c8',
          severity: 'medium',
          category: 'content',
          message: 'List at least 8 to 25 technical skills grouped logically by language, framework, and tooling.',
          fix: 'Expand the Technical Skills section.',
          location: { sectionId: resume.sections.find((s) => s.type === 'skills')?.id },
        });
      } else if (c.id === 'F4') {
        recs.push({
          id: 'rec_f4',
          severity: 'medium',
          category: 'formatting',
          message: 'Resume exceeds the standard 1-2 page length.',
          fix: 'Condense older entries, adjust font spacing to "compact", or trim bullets.',
        });
      } else if (c.id === 'F3') {
        recs.push({
          id: 'rec_f3',
          severity: 'low',
          category: 'formatting',
          message: 'Consider switching to a single-column layout for strict automated portal submissions.',
          fix: 'Choose "Minimal ATS" or "Software Engineer" template in the template switcher.',
        });
      } else if (c.id === 'C9') {
        recs.push({
          id: 'rec_c9',
          severity: 'low',
          category: 'content',
          message: 'Remove generic clichés ("hard worker", "team player").',
          fix: 'Show evidence of teamwork in project bullet descriptions rather than asserting it.',
        });
      }
    }
  }

  // 3. Top missing keywords (if job description was provided)
  const topMissing = missingKeywords.filter((k) => k.weight >= 2).slice(0, 5);
  for (const m of topMissing) {
    recs.push({
      id: `rec_kw_${m.term}`,
      severity: 'medium',
      category: 'keywords',
      message: `Job description mentions "${m.term}" which is missing from your resume.`,
      fix: `If you have experience with ${m.term}, incorporate it into your Skills or Project bullet points.`,
    });
  }

  // Deduplicate and sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  return recs.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
