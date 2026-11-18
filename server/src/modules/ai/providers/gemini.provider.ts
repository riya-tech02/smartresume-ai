import type { LLMProvider, LLMRequest, LLMResponse } from './LLMProvider.js';
import { env } from '../../../config/env.js';

export class GeminiProvider implements LLMProvider {
  readonly name = 'gemini' as const;

  async generate(req: LLMRequest): Promise<LLMResponse> {
    if (!env.AI_API_KEY) {
      throw new Error('AI_API_KEY is not configured for Gemini provider');
    }

    const modelName = env.AI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${env.AI_API_KEY}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), req.timeoutMs || 15000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: req.system }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: req.user }],
            },
          ],
          generationConfig: {
            temperature: req.temperature || 0.2,
            maxOutputTokens: req.maxTokens || 1024,
            responseMimeType: req.jsonMode ? 'application/json' : 'text/plain',
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        text: candidateText,
        model: modelName,
        usage: {
          inputTokens: data.usageMetadata?.promptTokenCount,
          outputTokens: data.usageMetadata?.candidatesTokenCount,
        },
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
