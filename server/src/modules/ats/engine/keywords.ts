import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalize, tokenize, generateNgrams, stem } from './text.js';
import type { KeywordHit } from '@smartresume/shared';

interface SkillEntry {
  canonical: string;
  aliases: string[];
  category: string;
}

interface SkillsData {
  skills: SkillEntry[];
  roleSkillMap?: Record<string, string[]>;
}

let skillsCache: SkillsData | null = null;
let aliasMap: Map<string, string> | null = null;

export function getSkillsDictionary(): SkillsData {
  if (!skillsCache) {
    try {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const dictPath = path.resolve(currentDir, '../data/skills-dictionary.json');
      const parsed = JSON.parse(fs.readFileSync(dictPath, 'utf8')) as Partial<SkillsData>;
      skillsCache = Array.isArray(parsed.skills) ? parsed as SkillsData : { skills: [] };
    } catch {
      skillsCache = { skills: [] };
    }
  }
  return skillsCache;
}

export function getAliasMap(): Map<string, string> {
  if (!aliasMap) {
    aliasMap = new Map();
    const { skills } = getSkillsDictionary();
    for (const skill of skills) {
      const canon = skill.canonical.toLowerCase();
      aliasMap.set(canon, canon);
      for (const alias of skill.aliases) {
        aliasMap.set(alias.toLowerCase(), canon);
      }
    }
  }
  return aliasMap;
}

/**
 * Extracts requirements & keywords from a Job Description text
 */
export function extractJdKeywords(jdText: string): KeywordHit[] {
  if (!jdText || jdText.trim().length === 0) return [];

  const normalized = normalize(jdText);
  const aliases = getAliasMap();
  const foundKeywords = new Map<string, KeywordHit>();

  // Check requirement sections for boost
  const requirementSectionRegex = /(?:requirements|qualifications|must have|skills required|what you'?ll need)[\s\S]*?(?=(?:responsibilities|benefits|about us|perks|$))/gi;
  const reqMatches = jdText.match(requirementSectionRegex);
  const reqTextNormalized = reqMatches ? normalize(reqMatches.join(' ')) : '';

  // 1. Match dictionary skills in JD
  const { skills } = getSkillsDictionary();
  for (const s of skills) {
    const candidates = [s.canonical, ...s.aliases];
    for (const c of candidates) {
      const escaped = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|\\s)${escaped}(?:\\s|$|[.,;])`, 'i');
      if (regex.test(normalized)) {
        const canonical = s.canonical;
        const isBoosted = reqTextNormalized && new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`, 'i').test(reqTextNormalized);
        const weight = isBoosted ? 3.0 : 2.0;

        if (!foundKeywords.has(canonical) || (foundKeywords.get(canonical)?.weight || 0) < weight) {
          foundKeywords.set(canonical, {
            term: canonical,
            canonical,
            weight,
            isSkill: true,
          });
        }
        break;
      }
    }
  }

  // 2. Extract frequent 1-grams and 2-grams (non-stopwords)
  const tokens = tokenize(normalized, true);
  const ngrams = generateNgrams(tokens, 2);
  const counts = new Map<string, number>();

  for (const gram of ngrams) {
    counts.set(gram, (counts.get(gram) || 0) + 1);
  }

  for (const [gram, count] of counts.entries()) {
    if (count >= 2 && gram.length >= 3) {
      const canon = aliases.get(gram) || gram;
      if (!foundKeywords.has(canon)) {
        const isBoosted = reqTextNormalized && reqTextNormalized.includes(gram);
        const weight = isBoosted ? 1.5 : 1.0;
        foundKeywords.set(canon, {
          term: gram,
          canonical: canon !== gram ? canon : undefined,
          weight,
          isSkill: false,
        });
      }
    }
  }

  // Return top 40 keywords sorted by weight descending
  return Array.from(foundKeywords.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 40);
}
