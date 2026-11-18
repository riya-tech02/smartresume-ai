// Data limits from PRD §10
export const LIMITS = {
  NAME_MIN: 1,
  NAME_MAX: 100,
  EMAIL_MAX: 254,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 72,
  RESUME_TITLE_MIN: 1,
  RESUME_TITLE_MAX: 80,
  HEADLINE_MAX: 120,
  SUMMARY_MAX: 1000,
  BULLET_MAX: 300,
  BULLETS_PER_ENTRY: 10,
  ENTRIES_PER_SECTION: 30,
  SECTIONS_PER_RESUME: 25,
  CUSTOM_SECTIONS_MAX: 5,
  URL_MAX: 300,
  JD_MIN: 50,
  JD_MAX: 10000,
  RESUME_JSON_MAX_KB: 200,
  RESUMES_PER_USER: 20,
  AI_DAILY_LIMIT_DEFAULT: 30,
  AI_PER_MINUTE_LIMIT: 10,
  PAGINATION_DEFAULT_LIMIT: 12,
  PAGINATION_MAX_LIMIT: 50,
} as const;

export const ACCENT_PALETTE = [
  '#4F46E5', // indigo (default)
  '#0891B2', // cyan
  '#059669', // emerald
  '#D97706', // amber
  '#DC2626', // red
  '#7C3AED', // violet
  '#2563EB', // blue
  '#0D9488', // teal
  '#64748B', // slate
  '#000000', // black
] as const;

export const FONT_SCALES = ['sm', 'md', 'lg'] as const;
export type FontScale = (typeof FONT_SCALES)[number];

export const SPACING_OPTIONS = ['compact', 'normal', 'relaxed'] as const;
export type SpacingOption = (typeof SPACING_OPTIONS)[number];
