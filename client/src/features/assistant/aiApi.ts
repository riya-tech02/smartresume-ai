import type { AiSuggestInput, AiSuggestResponse } from '@smartresume/shared';
import { api } from '../../lib/api';

export function requestAiSuggestion(input: AiSuggestInput): Promise<AiSuggestResponse> {
  return api.post<AiSuggestResponse>('/ai/suggest', input);
}
