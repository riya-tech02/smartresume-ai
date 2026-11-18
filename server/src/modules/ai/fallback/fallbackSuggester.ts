import type { AiFeature, AiSuggestion } from '@smartresume/shared';
import { suggestActionVerbs } from './actionVerbs.js';
import { getSkillsDictionary } from '../../ats/engine/keywords.js';

export function generateRuleBasedFallback(feature: AiFeature, payload: Record<string, unknown>): AiSuggestion[] {
  switch (feature) {
    case 'summary': {
      const headline = (payload.headline as string) || 'Software Engineer';
      const skills = Array.isArray(payload.skills) ? (payload.skills as string[]).slice(0, 4).join(', ') : 'modern web technologies';
      return [
        {
          improved: `Dedicated ${headline} with foundational proficiency in ${skills}. Proven aptitude in designing and deploying clean web applications and writing maintainable code [add metric].`,
          reason: 'Rule-based professional summary template combining your headline and top skills.',
        },
        {
          improved: `Detail-oriented ${headline} passionate about full-stack engineering. Experienced with ${skills}, eager to contribute to collaborative engineering teams and high-impact projects [add metric].`,
          reason: 'Rule-based career-objective style summary emphasizing collaboration and technical skills.',
        },
      ];
    }

    case 'improve-bullets': {
      const bullets = Array.isArray(payload.bullets) ? (payload.bullets as string[]) : [];
      const verbs = ['Engineered', 'Architected', 'Implemented', 'Streamlined', 'Deployed'];
      return bullets.map((b, i) => {
        const verb = verbs[i % verbs.length];
        const cleaned = b.replace(/^(worked on|helped with|responsible for|handled)\s+/i, '').trim();
        return {
          original: b,
          improved: `${verb} ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)} [add metric].`,
          reason: 'Rule-based enhancement: replaced passive opening with a strong action verb.',
        };
      });
    }

    case 'rewrite-project': {
      const name = (payload.projectName as string) || 'Project';
      const techStack = Array.isArray(payload.techStack) ? (payload.techStack as string[]).join(', ') : 'modern tech stack';
      return [
        {
          improved: `Architected and developed ${name} using ${techStack}, providing a responsive, user-centric interface [add metric].`,
          reason: 'Rule-based core architecture bullet.',
        },
        {
          improved: `Engineered robust backend APIs and modular data models for ${name}, ensuring data consistency and sub-second response times [add metric].`,
          reason: 'Rule-based backend execution bullet.',
        },
      ];
    }

    case 'suggest-skills': {
      const existing = new Set(Array.isArray(payload.existingSkills) ? (payload.existingSkills as string[]).map((s) => s.toLowerCase()) : []);
      const { roleSkillMap } = getSkillsDictionary();
      const defaultSkills = roleSkillMap?.fullstack || ['Docker', 'PostgreSQL', 'TypeScript', 'Git', 'REST APIs'];
      const missing = defaultSkills.filter((s) => !existing.has(s.toLowerCase()));

      return missing.slice(0, 8).map((skill) => ({
        improved: skill,
        reason: 'Recommended industry standard skill for software engineering roles.',
        requiresUserConfirmation: true,
      }));
    }

    case 'achievements': {
      const desc = String(payload.description || 'Delivered project milestone');
      return [
        {
          improved: `Successfully spearheaded ${desc.trim()}, resulting in notable operational efficiency and high adoption [add metric].`,
          reason: 'Framed narrative into an active achievement bullet.',
        },
      ];
    }

    case 'grammar': {
      const text = String(payload.text || '');
      const fixed = text
        .replace(/\s+/g, ' ')
        .replace(/\bi\b/g, 'I')
        .replace(/([.?!]\s*)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase())
        .trim();
      return [
        {
          original: text,
          improved: fixed,
          reason: 'Basic spacing, capitalization, and punctuation correction.',
        },
      ];
    }

    case 'action-verbs': {
      const verbs = suggestActionVerbs(payload.category as string);
      return verbs.map((v) => ({
        improved: v,
        reason: 'Recommended high-impact action verb.',
      }));
    }

    case 'tailor': {
      return [
        {
          improved: 'Enhanced project implementation to incorporate industry best practices and required keywords [add metric].',
          reason: 'Rule-based alignment with key job requirements.',
        },
      ];
    }

    default:
      return [
        {
          improved: 'Refined resume content to emphasize measurable results and technical depth [add metric].',
          reason: 'Standard rule-based enhancement.',
        },
      ];
  }
}
