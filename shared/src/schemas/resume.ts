import { z } from 'zod';
import { LIMITS } from '../constants/limits.js';
import { TEMPLATE_IDS } from '../constants/templates.js';
import { FONT_SCALES, SPACING_OPTIONS, ACCENT_PALETTE } from '../constants/limits.js';
import { personalInfoSchema, sectionSchema } from './section.js';

export const resumeSettingsSchema = z.object({
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default(ACCENT_PALETTE[0]),
  fontScale: z.enum(FONT_SCALES).default('md'),
  spacing: z.enum(SPACING_OPTIONS).default('normal'),
});

export const createResumeSchema = z.object({
  title: z.string().min(LIMITS.RESUME_TITLE_MIN).max(LIMITS.RESUME_TITLE_MAX).trim(),
  templateId: z.enum(TEMPLATE_IDS).default('fresher-student'),
  useSample: z.boolean().default(false),
});

export const updateResumeSchema = z.object({
  baseRevision: z.number().int().min(1),
  title: z.string().min(LIMITS.RESUME_TITLE_MIN).max(LIMITS.RESUME_TITLE_MAX).trim().optional(),
  templateId: z.enum(TEMPLATE_IDS).optional(),
  settings: resumeSettingsSchema.optional(),
  personalInfo: personalInfoSchema.optional(),
  sections: z.array(sectionSchema).max(LIMITS.SECTIONS_PER_RESUME).optional(),
});

export const duplicateResumeSchema = z.object({
  title: z.string().min(LIMITS.RESUME_TITLE_MIN).max(LIMITS.RESUME_TITLE_MAX).trim().optional(),
});

export const listResumesSchema = z.object({
  q: z.string().max(100).optional(),
  sort: z.enum(['-updatedAt', 'updatedAt', 'title', '-title', 'completion', '-completion']).default('-updatedAt'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(LIMITS.PAGINATION_MAX_LIMIT).default(LIMITS.PAGINATION_DEFAULT_LIMIT),
});

export type ResumeSettings = z.infer<typeof resumeSettingsSchema>;
export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
export type DuplicateResumeInput = z.infer<typeof duplicateResumeSchema>;
export type ListResumesInput = z.infer<typeof listResumesSchema>;
