import { SYSTEM_PROMPT_BASE } from './system.js';

export const PROMPT_VERSION_SUMMARY = 'summary@1';

export function buildSummaryPrompt(context: {
  headline?: string;
  skills?: string[];
  educationTitles?: string[];
  roleTitles?: string[];
  currentSummary?: string;
}) {
  const system = `${SYSTEM_PROMPT_BASE}
Task: Generate 2-3 professional resume summary options (30-80 words each).
Format as JSON: { "suggestions": [{ "improved": "summary text...", "reason": "brief explanation..." }] }`;

  const user = `Context:
Headline: ${context.headline || 'None provided'}
Skills: ${(context.skills || []).join(', ') || 'None provided'}
Education: ${(context.educationTitles || []).join(', ') || 'None provided'}
Experience/Projects: ${(context.roleTitles || []).join(', ') || 'None provided'}
Current summary to improve: ${context.currentSummary || 'None provided'}`;

  return { system, user, version: PROMPT_VERSION_SUMMARY };
}
