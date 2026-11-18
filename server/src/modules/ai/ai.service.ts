import { createProvider } from './providers/index.js';
import { QuotaManager } from './quota.js';
import { sanitizeContext } from './guards/sanitizeContext.js';
import { checkFacts } from './guards/factGuard.js';
import { cleanAndParseJson } from './guards/parseJson.js';
import { generateRuleBasedFallback } from './fallback/fallbackSuggester.js';
import { buildSummaryPrompt } from './prompts/summary.js';
import { buildImproveBulletsPrompt } from './prompts/improveBullets.js';
import { buildRewriteProjectPrompt } from './prompts/rewriteProject.js';
import { buildSuggestSkillsPrompt } from './prompts/suggestSkills.js';
import { buildAchievementsPrompt } from './prompts/achievements.js';
import { buildGrammarPrompt } from './prompts/grammar.js';
import { buildTailorPrompt } from './prompts/tailor.js';
import { ResumeModel } from '../resumes/resume.model.js';
import { AppError } from '../../utils/AppError.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';
import type { AiSuggestInput, AiSuggestion, AiSuggestionWarning } from '@smartresume/shared';

export class AiService {
  static async getStatus(userId: string) {
    const { remainingToday, consentAccepted } = await QuotaManager.getUsageStatus(userId);
    return {
      provider: env.AI_PROVIDER,
      mode: env.AI_PROVIDER === 'mock' ? 'Mock (offline deterministic)' : 'Live AI',
      remainingToday,
      consentAccepted,
    };
  }

  static async suggest(userId: string, input: AiSuggestInput) {
    const { feature, payload, resumeId } = input;

    // Feature: action-verbs is fully deterministic and needs no LLM or consent
    if (feature === 'action-verbs') {
      const suggestions = generateRuleBasedFallback('action-verbs', payload);
      return {
        feature,
        suggestions,
        meta: {
          provider: 'deterministic',
          fallback: false,
          warnings: [],
        },
      };
    }

    // Check consent for AI features
    await QuotaManager.checkConsent(userId);

    // Fetch resume for sanitized context (verifying ownership)
    const resume = await ResumeModel.findOne({ _id: resumeId, userId });
    if (!resume) throw AppError.notFound('Resume not found');

    const sanitized = sanitizeContext(resume.personalInfo);

    let promptData: { system: string; user: string; version: string };

    switch (feature) {
      case 'summary':
        promptData = buildSummaryPrompt({
          headline: (payload.headline as string) || sanitized.headline,
          skills: (payload.skills as string[]) || sanitized.skills,
          educationTitles: sanitized.educationTitles,
          roleTitles: sanitized.roleTitles,
        });
        break;
      case 'improve-bullets':
        promptData = buildImproveBulletsPrompt(
          String(payload.context || ''),
          Array.isArray(payload.bullets) ? (payload.bullets as string[]) : [],
        );
        break;
      case 'rewrite-project':
        promptData = buildRewriteProjectPrompt(
          String(payload.projectName || ''),
          Array.isArray(payload.techStack) ? (payload.techStack as string[]) : [],
          String(payload.description || ''),
        );
        break;
      case 'suggest-skills':
        promptData = buildSuggestSkillsPrompt(
          String(payload.targetRole || sanitized.headline || ''),
          Array.isArray(payload.existingSkills) ? (payload.existingSkills as string[]) : [],
        );
        break;
      case 'achievements':
        promptData = buildAchievementsPrompt(String(payload.description || ''));
        break;
      case 'grammar':
        promptData = buildGrammarPrompt(String(payload.text || ''));
        break;
      case 'tailor':
        promptData = buildTailorPrompt(
          String(payload.jobDescription || ''),
          String(payload.text || ''),
        );
        break;
      default:
        throw AppError.badRequest(`Unsupported AI feature: ${feature}`);
    }

    const provider = createProvider();
    let suggestions: AiSuggestion[] = [];
    let isFallback = false;
    let modelUsed = env.AI_MODEL;

    try {
      const llmRes = await provider.generate({
        system: promptData.system,
        user: promptData.user,
        jsonMode: true,
        maxTokens: 1024,
        temperature: 0.2,
        timeoutMs: env.AI_TIMEOUT_MS,
      });

      modelUsed = llmRes.model;
      const parsed = cleanAndParseJson<{ suggestions: AiSuggestion[] }>(llmRes.text);
      if (Array.isArray(parsed?.suggestions) && parsed.suggestions.length > 0) {
        suggestions = parsed.suggestions;
      } else {
        throw new Error('LLM output missing suggestions array');
      }
    } catch (err) {
      logger.warn({ err, feature }, 'LLM generation failed, falling back to rule-based suggester');
      suggestions = generateRuleBasedFallback(feature, payload);
      isFallback = true;
    }

    // Run Fact Guard across suggestions
    const sourceText = JSON.stringify(payload);
    const warnings: AiSuggestionWarning[] = [];

    for (const sug of suggestions) {
      const factWarnings = checkFacts(sourceText, sug.improved);
      warnings.push(...factWarnings);
    }

    // Record usage (fallback responses do NOT deduct from daily quota)
    await QuotaManager.checkAndRecordUsage(userId, feature, provider.name, isFallback);

    return {
      feature,
      suggestions,
      meta: {
        provider: isFallback ? 'rule-based-fallback' : provider.name,
        model: modelUsed,
        fallback: isFallback,
        promptVersion: promptData.version,
        warnings,
      },
    };
  }
}
