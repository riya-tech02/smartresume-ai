import type { LLMProvider, LLMRequest, LLMResponse } from './LLMProvider.js';

export class MockProvider implements LLMProvider {
  readonly name = 'mock' as const;

  async generate(req: LLMRequest): Promise<LLMResponse> {
    // Generate deterministic response based on system or user input
    let mockSuggestions: unknown[];

    if (req.user.includes('summary')) {
      mockSuggestions = [
        {
          improved: 'Results-driven software engineering graduate with hands-on experience in modern React, TypeScript, and Node.js architectures. Demonstrated track record building responsive web applications and scalable RESTful microservices [add metric]. Seeking an entry-level software development role.',
          reason: 'Clear value proposition emphasizing modern full-stack web stack and clean architecture.',
        },
        {
          improved: 'Passionate full-stack developer experienced in developing and optimizing web applications using React, Express, and cloud databases. Eager to contribute technical skills and collaborative problem-solving to innovative development teams [add metric].',
          reason: 'Emphasizes technical adaptability and collaborative engineering delivery.',
        },
      ];
    } else if (req.user.includes('improve-bullets')) {
      mockSuggestions = [
        {
          original: 'worked on web application',
          improved: 'Architected and deployed a full-stack web application using React and Node.js, improving workflow efficiency [add metric].',
          reason: 'Replaces passive verb with strong technical action verb and frames outcome.',
        },
        {
          original: 'made api endpoints',
          improved: 'Engineered 15+ secure RESTful API endpoints with Express and JWT authentication, maintaining 99.9% uptime [add metric].',
          reason: 'Highlights technical scale, security implementation, and performance standards.',
        },
      ];
    } else if (req.user.includes('suggest-skills')) {
      mockSuggestions = [
        { improved: 'Docker', reason: 'Industry-standard containerization tool for microservice deployments.' },
        { improved: 'PostgreSQL', reason: 'Widely requested relational database management system.' },
        { improved: 'CI/CD Pipelines', reason: 'Essential modern DevOps delivery practice.' },
        { improved: 'Jest / Vitest', reason: 'High-value automated testing capability.' },
      ];
    } else {
      mockSuggestions = [
        {
          improved: 'Engineered a full-stack web application with responsive UI and optimized database querying [add metric].',
          reason: 'Clear structure starting with a strong action verb and outcome focus.',
        },
      ];
    }

    return {
      text: JSON.stringify({ suggestions: mockSuggestions }),
      model: 'mock-engine-v1',
      usage: { inputTokens: 50, outputTokens: 120 },
    };
  }
}
