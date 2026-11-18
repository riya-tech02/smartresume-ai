export interface AiSuggestion {
  original?: string;
  improved: string;
  reason?: string;
  requiresUserConfirmation?: boolean;
}

export interface AiSuggestResponse {
  feature: string;
  suggestions: AiSuggestion[];
}

export interface AiStatus {
  provider: string;
  mode: string;
  remainingToday: number;
  consentAccepted: boolean;
}
