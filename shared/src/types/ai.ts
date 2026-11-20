import type { AiSuggestionMeta } from '../schemas/ai.js';

export interface AiSuggestion {
  original?: string;
  improved: string;
  reason?: string;
  requiresUserConfirmation?: boolean;
}

export interface AiSuggestResponse {
  feature: string;
  suggestions: AiSuggestion[];
  meta: AiSuggestionMeta;
}

export interface AiStatus {
  provider: string;
  mode: string;
  remainingToday: number;
  consentAccepted: boolean;
}
