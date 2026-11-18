import { SYSTEM_PROMPT_BASE } from './system.js';

export const PROMPT_VERSION_REWRITE_PROJECT = 'rewrite-project@1';

export function buildRewriteProjectPrompt(projectName: string, techStack: string[], description: string) {
  const system = `${SYSTEM_PROMPT_BASE}
Task: Rewrite the project description into 2-4 impactful bullet points highlighting tech stack and achievements. Insert "[add metric]" where quantified results would help.
Format as JSON: { "suggestions": [{ "improved": "bullet 1", "reason": "reason" }, { "improved": "bullet 2", "reason": "reason" }] }`;

  const user = `Project: ${projectName}
Tech Stack: ${techStack.join(', ') || 'Not specified'}
<user_text>
${description}
</user_text>`;

  return { system, user, version: PROMPT_VERSION_REWRITE_PROJECT };
}
