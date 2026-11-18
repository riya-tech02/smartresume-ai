import { SYSTEM_PROMPT_BASE } from './system.js';

export const PROMPT_VERSION_TAILOR = 'tailor@1';

export function buildTailorPrompt(jobDescription: string, bulletOrSectionText: string) {
  const system = `${SYSTEM_PROMPT_BASE}
Task: Suggest truthful rewordings of the provided resume bullets to better emphasize skills and keywords required by the job description. Do not invent experience or achievements.
Format as JSON: { "suggestions": [{ "original": "original bullet", "improved": "tailored bullet", "reason": "matches JD requirements" }] }`;

  const user = `<job_description>
${jobDescription.slice(0, 3000)}
</job_description>

<user_text>
${bulletOrSectionText}
</user_text>`;

  return { system, user, version: PROMPT_VERSION_TAILOR };
}
