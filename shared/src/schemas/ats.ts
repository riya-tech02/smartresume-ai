import { z } from 'zod';
import { LIMITS } from '../constants/limits.js';

export const runAtsSchema = z.object({
  jobDescription: z.string().min(LIMITS.JD_MIN).max(LIMITS.JD_MAX).optional(),
});

export const jobMatchSchema = z.object({
  jobDescription: z.string().min(LIMITS.JD_MIN).max(LIMITS.JD_MAX),
  jobTitle: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  useAi: z.boolean().default(false),
});

export type RunAtsInput = z.infer<typeof runAtsSchema>;
export type JobMatchInput = z.infer<typeof jobMatchSchema>;
