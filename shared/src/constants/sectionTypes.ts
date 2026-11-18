export const SECTION_TYPES = [
  'summary',
  'education',
  'skills',
  'experience',
  'internships',
  'projects',
  'certifications',
  'achievements',
  'extracurricular',
  'languages',
  'custom',
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const UNIQUE_SECTION_TYPES: SectionType[] = [
  'summary',
  'education',
  'skills',
  'experience',
  'internships',
  'projects',
  'certifications',
  'achievements',
  'extracurricular',
  'languages',
];

export const SECTION_LABELS: Record<SectionType, string> = {
  summary: 'Professional Summary',
  education: 'Education',
  skills: 'Technical Skills',
  experience: 'Work Experience',
  internships: 'Internships',
  projects: 'Projects',
  certifications: 'Certifications',
  achievements: 'Achievements',
  extracurricular: 'Extracurricular Activities',
  languages: 'Languages',
  custom: 'Custom Section',
};
