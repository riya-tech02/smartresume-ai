export interface LLMRequest {
  system: string;
  user: string;
  jsonMode: boolean;
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
}

export interface LLMResponse {
  text: string;
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

export interface LLMProvider {
  readonly name: 'gemini' | 'openai' | 'mock';
  generate(req: LLMRequest): Promise<LLMResponse>;
}
