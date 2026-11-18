import { SYSTEM_PROMPT_BASE } from './system.js';

export const PROMPT_VERSION_IMPROVE_BULLETS = 'improve-bullets@1';

export function buildImproveBulletsPrompt(context: string, bullets: string[]) {
  const system = `${SYSTEM_PROMPT_BASE}
Task: Improve each provided resume bullet point. Start with a strong action verb. Include "[add metric]" if unquantified. Never invent facts.
Format as JSON: { "suggestions": [{ "original": "original bullet", "improved": "improved bullet", "reason": "why improved" }] }`;

  const user = `Role/Project Context: ${context || 'General experience'}
<user_text>
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}
</user_text>`;

  return { system, user, version: PROMPT_VERSION_IMPROVE_BULLETS };
}
