import { z } from 'zod';
import { LIMITS } from '../constants/limits.js';

export const AI_FEATURES = [
  'summary',
  'improve-bullets',
  'rewrite-project',
  'suggest-skills',
  'achievements',
  'grammar',
  'action-verbs',
  'tailor',
] as const;

export type AiFeature = (typeof AI_FEATURES)[number];

export const aiSuggestSchema = z.object({
  feature: z.enum(AI_FEATURES),
  resumeId: z.string().min(1),
  payload: z.record(z.unknown()),
});

export const aiSuggestionWarning = z.object({
  type: z.enum(['unsupported_detail']),
  value: z.string(),
  message: z.string(),
});

export const aiSuggestionMeta = z.object({
  provider: z.string(),
  model: z.string().optional(),
  fallback: z.boolean(),
  promptVersion: z.string().optional(),
  warnings: z.array(aiSuggestionWarning).default([]),
});

export type AiSuggestInput = z.infer<typeof aiSuggestSchema>;
export type AiSuggestionWarning = z.infer<typeof aiSuggestionWarning>;
export type AiSuggestionMeta = z.infer<typeof aiSuggestionMeta>;
