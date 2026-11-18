// Template IDs and metadata
export const TEMPLATE_IDS = [
  'modern-professional',
  'minimal-ats',
  'software-engineer',
  'fresher-student',
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  layout: string;
  typography: string;
  intendedFor: string;
  atsSafe: boolean;
  category: string;
  atsRating: number;
  bestFor: string[];
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'Two-column layout with accent header. Best for non-ATS applications.',
    layout: 'Two columns (sidebar: contact, skills, languages; main: rest)',
    typography: 'Inter',
    intendedFor: 'Non-ATS-portal applications, professionals',
    atsSafe: false,
    category: 'Professional',
    atsRating: 72,
    bestFor: ['Experienced professionals', 'Management', 'Business'],
  },
  {
    id: 'minimal-ats',
    name: 'Minimal ATS-Friendly',
    description: 'Single column, clean, minimal design optimized for ATS parsing.',
    layout: 'Single column, black text, thin dividers',
    typography: 'Arimo',
    intendedFor: 'Strict ATS portals',
    atsSafe: true,
    category: 'ATS',
    atsRating: 98,
    bestFor: ['Corporate roles', 'Government', 'Legal'],
  },
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    description: 'Dense single column layout with skills-first approach and tech tags.',
    layout: 'Single column, dense, skills-first',
    typography: 'IBM Plex Sans + IBM Plex Mono',
    intendedFor: 'SWE internships/jobs',
    atsSafe: true,
    category: 'Technical',
    atsRating: 95,
    bestFor: ['Software engineers', 'Developers', 'Technical roles'],
  },
  {
    id: 'fresher-student',
    name: 'Fresher / Student',
    description: 'Education-focused, spacious layout perfect for students with limited experience.',
    layout: 'Single column, education before experience, spacious',
    typography: 'Source Sans 3',
    intendedFor: 'Students with little experience',
    atsSafe: true,
    category: 'Student',
    atsRating: 94,
    bestFor: ['Students', 'Recent graduates', 'Internships'],
  },
];

export const DEFAULT_TEMPLATE_ID: TemplateId = 'fresher-student';
