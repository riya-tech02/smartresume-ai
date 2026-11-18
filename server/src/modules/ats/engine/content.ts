import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ResumeData, AtsCheck } from '@smartresume/shared';
import { normalize, tokenize } from './text.js';

interface ActionVerbsData {
  all: string[];
}

let verbsCache: Set<string> | null = null;
let weakPhrasesCache: string[] | null = null;
let clichesCache: string[] | null = null;

function getActionVerbs(): Set<string> {
  if (!verbsCache) {
    try {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const p = path.resolve(currentDir, '../data/action-verbs.json');
      const data: ActionVerbsData = JSON.parse(fs.readFileSync(p, 'utf8'));
      verbsCache = new Set(data.all.map((v) => v.toLowerCase()));
    } catch {
      verbsCache = new Set(['developed', 'built', 'created', 'implemented', 'designed', 'led', 'optimized']);
    }
  }
  return verbsCache;
}

function getWeakPhrases(): string[] {
  if (!weakPhrasesCache) {
    try {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const p = path.resolve(currentDir, '../data/weak-phrases.json');
      const parsed: unknown = JSON.parse(fs.readFileSync(p, 'utf8'));
      weakPhrasesCache = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : ['responsible for', 'worked on', 'helped with', 'duties included'];
    } catch {
      weakPhrasesCache = ['responsible for', 'worked on', 'helped with', 'duties included'];
    }
  }
  return weakPhrasesCache;
}

function getCliches(): string[] {
  if (!clichesCache) {
    try {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const p = path.resolve(currentDir, '../data/cliches.json');
      const parsed: unknown = JSON.parse(fs.readFileSync(p, 'utf8'));
      clichesCache = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : ['team player', 'hard-working', 'go-getter', 'results-oriented'];
    } catch {
      clichesCache = ['team player', 'hard-working', 'go-getter', 'results-oriented'];
    }
  }
  return clichesCache;
}

export function runContentChecks(resume: ResumeData): AtsCheck[] {
  const checks: AtsCheck[] = [];
  const visibleSections = (resume.sections || []).filter((s) => s.visible !== false);

  // Collect all bullet points
  const bullets: string[] = [];
  for (const s of visibleSections) {
    if (['experience', 'internships', 'projects', 'custom', 'extracurricular'].includes(s.type)) {
      const entries = (s.data as { entries?: Array<{ bullets?: string[] }> }).entries || [];
      for (const e of entries) {
        if (Array.isArray(e.bullets)) {
          bullets.push(...e.bullets.filter((b) => b && b.trim().length > 0));
        }
      }
    }
  }

  const actionVerbs = getActionVerbs();
  const weakPhrases = getWeakPhrases();
  const cliches = getCliches();

  // C1: >= 80% bullets start with a strong action verb
  let strongVerbBullets = 0;
  const firstWords: string[] = [];
  for (const b of bullets) {
    const tokens = tokenize(b);
    if (tokens.length > 0) {
      const first = tokens[0]!.toLowerCase();
      firstWords.push(first);
      if (actionVerbs.has(first)) {
        strongVerbBullets++;
      }
    }
  }
  const verbRatio = bullets.length > 0 ? strongVerbBullets / bullets.length : 0;
  const c1Passed = bullets.length > 0 && verbRatio >= 0.8;
  checks.push({
    id: 'C1',
    category: 'content',
    label: 'Action-Oriented Bullets',
    passed: c1Passed,
    score: bullets.length === 0 ? 0 : verbRatio >= 0.8 ? 1 : Math.max(0.1, verbRatio),
    detail: bullets.length === 0
      ? 'No experience or project bullets found. Add detailed bullet points.'
      : c1Passed
      ? `${Math.round(verbRatio * 100)}% of bullets begin with strong action verbs.`
      : `Only ${Math.round(verbRatio * 100)}% of bullets start with a strong action verb (target is ≥80%).`,
  });

  // C2: >= 30% bullets quantified
  let quantifiedBullets = 0;
  const metricRegex = /\b\d+(?:[.,]\d+)?%?|\b(?:\$|€|£|₹)\d+|\b\d+\s*(?:k|m|users|requests|ms|seconds|hours|percent)\b/i;
  for (const b of bullets) {
    if (metricRegex.test(b)) {
      quantifiedBullets++;
    }
  }
  const quantifiedRatio = bullets.length > 0 ? quantifiedBullets / bullets.length : 0;
  const c2Passed = bullets.length > 0 && quantifiedRatio >= 0.3;
  checks.push({
    id: 'C2',
    category: 'content',
    label: 'Quantified Impact & Metrics',
    passed: c2Passed,
    score: bullets.length === 0 ? 0 : quantifiedRatio >= 0.3 ? 1 : Math.max(0.1, (quantifiedRatio / 0.3)),
    detail: bullets.length === 0
      ? 'No bullets found to evaluate quantified impact.'
      : c2Passed
      ? `${Math.round(quantifiedRatio * 100)}% of bullets contain measurable metrics.`
      : `Only ${Math.round(quantifiedRatio * 100)}% of bullets have measurable metrics (target is ≥30%). Add numbers, %, or time saved.`,
  });

  // C3: Bullet length 8-28 words
  let goodLengthBullets = 0;
  for (const b of bullets) {
    const wordCount = tokenize(b).length;
    if (wordCount >= 8 && wordCount <= 28) {
      goodLengthBullets++;
    }
  }
  const lengthRatio = bullets.length > 0 ? goodLengthBullets / bullets.length : 0;
  const c3Passed = bullets.length > 0 && lengthRatio >= 0.75;
  checks.push({
    id: 'C3',
    category: 'content',
    label: 'Bullet Length & Conciseness',
    passed: c3Passed,
    score: bullets.length === 0 ? 0 : lengthRatio >= 0.75 ? 1 : Math.max(0.1, lengthRatio),
    detail: bullets.length === 0
      ? 'No bullets found.'
      : c3Passed
      ? 'Bullets are concise and well-paced (8-28 words).'
      : `${bullets.length - goodLengthBullets} bullet(s) are too short (<8 words) or overly long (>28 words).`,
  });

  // C4: No weak phrases
  let foundWeakPhrases = 0;
  const normalizedAllText = normalize(JSON.stringify(resume));
  const hasSubstantialText = normalizedAllText.length >= 50;

  for (const phrase of weakPhrases) {
    if (normalizedAllText.includes(phrase)) {
      foundWeakPhrases++;
    }
  }
  const c4Passed = hasSubstantialText && foundWeakPhrases === 0;
  checks.push({
    id: 'C4',
    category: 'content',
    label: 'No Passive / Weak Phrasing',
    passed: c4Passed,
    score: !hasSubstantialText ? 0 : c4Passed ? 1 : Math.max(0.2, 1 - foundWeakPhrases * 0.25),
    detail: !hasSubstantialText
      ? 'Insufficient content to evaluate phrasing.'
      : c4Passed
      ? 'No passive phrases like "responsible for" or "helped with" found.'
      : `Found ${foundWeakPhrases} passive phrases ("responsible for", "worked on", etc.). Replace with active verbs.`,
  });

  // C5: No first-person pronouns
  const firstPersonRegex = /\b(i|me|my|myself|we|our|us)\b/gi;
  const pronounMatches = normalizedAllText.match(firstPersonRegex) || [];
  const c5Passed = hasSubstantialText && pronounMatches.length === 0;
  checks.push({
    id: 'C5',
    category: 'content',
    label: 'No First-Person Pronouns',
    passed: c5Passed,
    score: !hasSubstantialText ? 0 : c5Passed ? 1 : Math.max(0.2, 1 - pronounMatches.length * 0.2),
    detail: !hasSubstantialText
      ? 'Insufficient content to evaluate pronouns.'
      : c5Passed
      ? 'Written in professional third-person/implicit voice without "I", "me", or "my".'
      : `Found ${pronounMatches.length} first-person pronoun(s) ("I", "my", "we"). Modern resumes omit personal pronouns.`,
  });

  // C6: Summary 30-80 words
  const summarySec = visibleSections.find((s) => s.type === 'summary');
  let c6Passed = false;
  let summaryWordCount = 0;
  if (summarySec && summarySec.data && 'text' in summarySec.data && typeof summarySec.data.text === 'string') {
    summaryWordCount = tokenize(summarySec.data.text).length;
    c6Passed = summaryWordCount >= 25 && summaryWordCount <= 90;
  }
  checks.push({
    id: 'C6',
    category: 'content',
    label: 'Professional Summary Length',
    passed: c6Passed,
    score: !summarySec ? 0.3 : c6Passed ? 1 : 0.4,
    detail: !summarySec
      ? 'No summary section present.'
      : c6Passed
      ? `Summary is optimal length (${summaryWordCount} words).`
      : `Summary is ${summaryWordCount} words (ideal range is 30-80 words).`,
  });

  // C7: No verb used to start > 2 bullets
  const verbFreq = new Map<string, number>();
  for (const w of firstWords) {
    verbFreq.set(w, (verbFreq.get(w) || 0) + 1);
  }
  let repetitiveVerbsCount = 0;
  for (const [, count] of verbFreq.entries()) {
    if (count > 2) repetitiveVerbsCount++;
  }
  const c7Passed = bullets.length > 0 && repetitiveVerbsCount === 0;
  checks.push({
    id: 'C7',
    category: 'content',
    label: 'Action Verb Variety',
    passed: c7Passed,
    score: bullets.length === 0 ? 0 : c7Passed ? 1 : Math.max(0.3, 1 - repetitiveVerbsCount * 0.2),
    detail: bullets.length === 0
      ? 'No bullets to check for verb variety.'
      : c7Passed
      ? 'Great variety of opening action verbs across bullets.'
      : `${repetitiveVerbsCount} action verb(s) are repeated more than twice at the beginning of bullets.`,
  });

  // C8: 8-25 skills listed
  let totalSkills = 0;
  const skillsSec = visibleSections.find((s) => s.type === 'skills');
  if (skillsSec && skillsSec.data && 'groups' in skillsSec.data && Array.isArray(skillsSec.data.groups)) {
    for (const g of skillsSec.data.groups as Array<{ items?: string[] }>) {
      totalSkills += g.items?.length || 0;
    }
  }
  const c8Passed = totalSkills >= 8 && totalSkills <= 35;
  checks.push({
    id: 'C8',
    category: 'content',
    label: 'Skills Inventory Breadth (8-30 Skills)',
    passed: c8Passed,
    score: c8Passed ? 1 : totalSkills === 0 ? 0 : totalSkills < 8 ? Math.max(0.2, totalSkills / 8) : 0.7,
    detail: c8Passed
      ? `Lists a strong inventory of ${totalSkills} technical skills.`
      : totalSkills === 0
      ? 'No skills listed. Technical skills are essential.'
      : totalSkills < 8
      ? `Only ${totalSkills} skills listed. Aim for at least 8 relevant technical skills.`
      : `Lists ${totalSkills} skills. Consider refining to the top 25-30 most relevant skills.`,
  });

  // C9: No clichés
  let foundCliches = 0;
  for (const c of cliches) {
    if (normalizedAllText.includes(c)) {
      foundCliches++;
    }
  }
  const c9Passed = hasSubstantialText && foundCliches === 0;
  checks.push({
    id: 'C9',
    category: 'content',
    label: 'No Vague Buzzwords or Clichés',
    passed: c9Passed,
    score: !hasSubstantialText ? 0 : c9Passed ? 1 : Math.max(0.3, 1 - foundCliches * 0.25),
    detail: !hasSubstantialText
      ? 'Insufficient content.'
      : c9Passed
      ? 'No empty buzzwords ("go-getter", "team player") detected.'
      : `Found ${foundCliches} cliché buzzword(s). Demonstrate these traits through concrete results instead.`,
  });

  return checks;
}
