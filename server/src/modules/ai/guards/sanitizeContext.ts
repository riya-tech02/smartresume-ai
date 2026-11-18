import type { PersonalInfo } from '@smartresume/shared';

export interface SanitizedContext {
  headline?: string;
  skills?: string[];
  educationTitles?: string[];
  roleTitles?: string[];
}

/**
 * Sanitizes context passed to LLM.
 * CRITICAL RULE: email, phone, URLs, and street address are NEVER sent to the LLM.
 */
export function sanitizeContext(
  personalInfo: Partial<PersonalInfo>,
  skills: string[] = [],
  educationTitles: string[] = [],
  roleTitles: string[] = [],
): SanitizedContext {
  return {
    headline: personalInfo?.headline || '',
    skills: skills.slice(0, 30),
    educationTitles: educationTitles.slice(0, 5),
    roleTitles: roleTitles.slice(0, 5),
  };
}
