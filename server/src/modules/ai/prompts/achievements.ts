import { SYSTEM_PROMPT_BASE } from './system.js';

export const PROMPT_VERSION_ACHIEVEMENTS = 'achievements@1';

export function buildAchievementsPrompt(description: string) {
  const system = `${SYSTEM_PROMPT_BASE}
Task: Convert the provided narrative description into 2-4 achievement-oriented bullet points with "[add metric]" placeholders.
Format as JSON: { "suggestions": [{ "improved": "bullet text...", "reason": "achievement framed" }] }`;

  const user = `<user_text>
${description}
</user_text>`;

  return { system, user, version: PROMPT_VERSION_ACHIEVEMENTS };
}
