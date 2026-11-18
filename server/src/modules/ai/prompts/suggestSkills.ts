import { SYSTEM_PROMPT_BASE } from './system.js';

export const PROMPT_VERSION_SUGGEST_SKILLS = 'suggest-skills@1';

export function buildSuggestSkillsPrompt(targetRole: string, existingSkills: string[]) {
  const system = `${SYSTEM_PROMPT_BASE}
Task: Suggest up to 10 in-demand technical skills for the given role that are NOT already listed.
Format as JSON: { "suggestions": [{ "improved": "Skill Name", "reason": "Why relevant for this role", "requiresUserConfirmation": true }] }`;

  const user = `Target Role: ${targetRole || 'Software Engineer'}
Existing Skills: ${existingSkills.join(', ') || 'None'}`;

  return { system, user, version: PROMPT_VERSION_SUGGEST_SKILLS };
}
