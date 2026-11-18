import { z } from 'zod';
import { LIMITS } from '../constants/limits.js';
import { SECTION_TYPES } from '../constants/sectionTypes.js';

// Date format: "YYYY-MM" or empty string
const dateField = z.string().regex(/^(\d{4}-(0[1-9]|1[0-2]))?$/, 'Must be YYYY-MM or empty');
const urlField = z
  .string()
  .max(LIMITS.URL_MAX)
  .regex(/^https?:\/\/.+/, 'Must start with http:// or https://')
  .or(z.literal(''));
const bulletField = z.string().max(LIMITS.BULLET_MAX);

// Entry IDs are client-generated UUIDs
const entryId = z.string().min(1).max(100);

// Link (LinkedIn, GitHub, etc.)
export const linkSchema = z.object({
  id: entryId,
  label: z.string().min(1).max(50),
  url: urlField,
});

// Personal Information
export const personalInfoSchema = z.object({
  fullName: z.string().min(LIMITS.NAME_MIN).max(LIMITS.NAME_MAX),
  headline: z.string().max(LIMITS.HEADLINE_MAX).default(''),
  email: z.string().email().max(LIMITS.EMAIL_MAX).default(''),
  phone: z.string().max(30).default(''),
  location: z.string().max(100).default(''),
  links: z.array(linkSchema).max(10).default([]),
});

// Section entries by type
export const educationEntrySchema = z.object({
  id: entryId,
  institution: z.string().max(200).default(''),
  degree: z.string().max(200).default(''),
  field: z.string().max(200).default(''),
  location: z.string().max(100).default(''),
  startDate: dateField.default(''),
  endDate: dateField.default(''),
  current: z.boolean().default(false),
  grade: z.string().max(50).default(''),
  details: z.array(bulletField).max(LIMITS.BULLETS_PER_ENTRY).default([]),
});

export const experienceEntrySchema = z.object({
  id: entryId,
  role: z.string().max(200).default(''),
  organization: z.string().max(200).default(''),
  location: z.string().max(100).default(''),
  startDate: dateField.default(''),
  endDate: dateField.default(''),
  current: z.boolean().default(false),
  bullets: z.array(bulletField).max(LIMITS.BULLETS_PER_ENTRY).default([]),
});

export const projectEntrySchema = z.object({
  id: entryId,
  name: z.string().max(200).default(''),
  link: urlField.default(''),
  techStack: z.array(z.string().max(50)).max(20).default([]),
  startDate: dateField.default(''),
  endDate: dateField.default(''),
  bullets: z.array(bulletField).max(LIMITS.BULLETS_PER_ENTRY).default([]),
});

export const certificationEntrySchema = z.object({
  id: entryId,
  name: z.string().max(200).default(''),
  issuer: z.string().max(200).default(''),
  date: dateField.default(''),
  link: urlField.default(''),
});

export const achievementEntrySchema = z.object({
  id: entryId,
  title: z.string().max(300).default(''),
  date: dateField.default(''),
  description: z.string().max(500).default(''),
});

export const languageEntrySchema = z.object({
  id: entryId,
  language: z.string().max(50).default(''),
  proficiency: z.enum(['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic']).default('Intermediate'),
});

export const skillGroupSchema = z.object({
  id: entryId,
  category: z.string().max(100).default(''),
  items: z.array(z.string().max(50)).max(30).default([]),
});

export const customEntrySchema = z.object({
  id: entryId,
  title: z.string().max(200).default(''),
  subtitle: z.string().max(200).default(''),
  date: dateField.default(''),
  bullets: z.array(bulletField).max(LIMITS.BULLETS_PER_ENTRY).default([]),
});

// Section base + discriminated union
const sectionBase = z.object({
  id: entryId,
  type: z.enum(SECTION_TYPES),
  title: z.string().min(1).max(100),
  visible: z.boolean().default(true),
});

export const sectionSchema = z.discriminatedUnion('type', [
  sectionBase.extend({
    type: z.literal('summary'),
    data: z.object({ text: z.string().max(LIMITS.SUMMARY_MAX).default('') }),
  }),
  sectionBase.extend({
    type: z.literal('education'),
    data: z.object({ entries: z.array(educationEntrySchema).max(LIMITS.ENTRIES_PER_SECTION).default([]) }),
  }),
  sectionBase.extend({
    type: z.literal('skills'),
    data: z.object({ groups: z.array(skillGroupSchema).max(LIMITS.ENTRIES_PER_SECTION).default([]) }),
  }),
  sectionBase.extend({
    type: z.literal('experience'),
    data: z.object({ entries: z.array(experienceEntrySchema).max(LIMITS.ENTRIES_PER_SECTION).default([]) }),
  }),
  sectionBase.extend({
    type: z.literal('internships'),
    data: z.object({ entries: z.array(experienceEntrySchema).max(LIMITS.ENTRIES_PER_SECTION).default([]) }),
  }),
  sectionBase.extend({
    type: z.literal('projects'),
    data: z.object({ entries: z.array(projectEntrySchema).max(LIMITS.ENTRIES_PER_SECTION).default([]) }),
  }),
  sectionBase.extend({
    type: z.literal('certifications'),
    data: z.object({ entries: z.array(certificationEntrySchema).max(LIMITS.ENTRIES_PER_SECTION).default([]) }),
  }),
  sectionBase.extend({
    type: z.literal('achievements'),
    data: z.object({ entries: z.array(achievementEntrySchema).max(LIMITS.ENTRIES_PER_SECTION).default([]) }),
  }),
  sectionBase.extend({
    type: z.literal('extracurricular'),
    data: z.object({ entries: z.array(experienceEntrySchema).max(LIMITS.ENTRIES_PER_SECTION).default([]) }),
  }),
  sectionBase.extend({
    type: z.literal('languages'),
    data: z.object({ entries: z.array(languageEntrySchema).max(LIMITS.ENTRIES_PER_SECTION).default([]) }),
  }),
  sectionBase.extend({
    type: z.literal('custom'),
    data: z.object({ entries: z.array(customEntrySchema).max(LIMITS.ENTRIES_PER_SECTION).default([]) }),
  }),
]);

export type Section = z.infer<typeof sectionSchema>;
export type SummaryData = Extract<Section, { type: 'summary' }>['data'];
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Link = z.infer<typeof linkSchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type CertificationEntry = z.infer<typeof certificationEntrySchema>;
export type AchievementEntry = z.infer<typeof achievementEntrySchema>;
export type LanguageEntry = z.infer<typeof languageEntrySchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type CustomEntry = z.infer<typeof customEntrySchema>;
