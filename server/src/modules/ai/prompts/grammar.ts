import { SYSTEM_PROMPT_BASE } from './system.js';

export const PROMPT_VERSION_GRAMMAR = 'grammar@1';

export function buildGrammarPrompt(text: string) {
  const system = `${SYSTEM_PROMPT_BASE}
Task: Correct grammatical mistakes, typos, and improve sentence clarity while preserving meaning and voice.
Format as JSON: { "suggestions": [{ "original": "original text", "improved": "corrected text", "reason": "summary of grammar fixes" }] }`;

  const user = `<user_text>
${text}
</user_text>`;

  return { system, user, version: PROMPT_VERSION_GRAMMAR };
}
