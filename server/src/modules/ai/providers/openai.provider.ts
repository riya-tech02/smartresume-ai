import type { LLMProvider, LLMRequest, LLMResponse } from './LLMProvider.js';
import { env } from '../../../config/env.js';

export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai' as const;

  async generate(req: LLMRequest): Promise<LLMResponse> {
    if (!env.AI_API_KEY) {
      throw new Error('AI_API_KEY is not configured for OpenAI provider');
    }

    const baseUrl = env.AI_BASE_URL || 'https://api.openai.com/v1';
    const modelName = env.AI_MODEL || 'gpt-4o-mini';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), req.timeoutMs || 15000);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.AI_API_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: req.system },
            { role: 'user', content: req.user },
          ],
          temperature: req.temperature || 0.2,
          max_tokens: req.maxTokens || 1024,
          response_format: req.jsonMode ? { type: 'json_object' } : undefined,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return {
        text: content,
        model: modelName,
        usage: {
          inputTokens: data.usage?.prompt_tokens,
          outputTokens: data.usage?.completion_tokens,
        },
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
