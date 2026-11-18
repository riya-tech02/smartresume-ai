import type { LLMProvider } from './LLMProvider.js';
import { GeminiProvider } from './gemini.provider.js';
import { OpenAIProvider } from './openai.provider.js';
import { MockProvider } from './mock.provider.js';
import { env } from '../../../config/env.js';

export function createProvider(): LLMProvider {
  switch (env.AI_PROVIDER) {
    case 'gemini':
      return new GeminiProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'mock':
    default:
      return new MockProvider();
  }
}

export * from './LLMProvider.js';
