import { z } from 'zod';
import { LIMITS } from '../constants/limits.js';

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/;

export const registerSchema = z.object({
  name: z.string().min(LIMITS.NAME_MIN).max(LIMITS.NAME_MAX).trim(),
  email: z.string().email().max(LIMITS.EMAIL_MAX).trim().toLowerCase(),
  password: z
    .string()
    .min(LIMITS.PASSWORD_MIN, 'Password must be at least 8 characters')
    .max(LIMITS.PASSWORD_MAX, 'Password must be at most 72 characters')
    .regex(passwordRegex, 'Must contain at least one letter and one number'),
});

export const loginSchema = z.object({
  email: z.string().email().max(LIMITS.EMAIL_MAX).trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(LIMITS.PASSWORD_MIN, 'Password must be at least 8 characters')
    .max(LIMITS.PASSWORD_MAX, 'Password must be at most 72 characters')
    .regex(passwordRegex, 'Must contain at least one letter and one number'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(LIMITS.NAME_MIN).max(LIMITS.NAME_MAX).trim().optional(),
  aiConsentAccepted: z.boolean().optional(),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete your account'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
