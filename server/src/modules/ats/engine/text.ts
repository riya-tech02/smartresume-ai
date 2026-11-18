import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load stopwords
let stopwordsSet: Set<string> | null = null;

function getStopwords(): Set<string> {
  if (!stopwordsSet) {
    try {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const stopwordsPath = path.resolve(currentDir, '../data/stopwords.json');
      const data = JSON.parse(fs.readFileSync(stopwordsPath, 'utf8'));
      stopwordsSet = new Set(data.map((w: string) => w.toLowerCase()));
    } catch {
      stopwordsSet = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'is', 'for', 'with', 'on']);
    }
  }
  return stopwordsSet;
}

/**
 * Normalizes text: lowercase, NFKD unicode normalization,
 * strips special punctuation but preserves technical tokens like c++, c#, node.js, rest api
 */
export function normalize(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^\w\s+#.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenizes text into words
 */
export function tokenize(text: string, removeStopwords = false): string[] {
  const normalized = normalize(text);
  if (!normalized) return [];

  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (!removeStopwords) return tokens;

  const stopwords = getStopwords();
  return tokens.filter((t) => !stopwords.has(t));
}

/**
 * Simple English stemmer for plurals, -ed, -ing
 */
export function stem(word: string): string {
  const w = word.toLowerCase().trim();
  if (w.length <= 3) return w;

  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('ses') && w.length > 4) return w.slice(0, -1);
  if (w.endsWith('es') && w.length > 3) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);

  return w;
}

/**
 * Generates n-grams (1 to n)
 */
export function generateNgrams(tokens: string[], maxN = 3): string[] {
  const ngrams: string[] = [];
  const len = tokens.length;

  for (let n = 1; n <= maxN; n++) {
    for (let i = 0; i <= len - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
  }

  return ngrams;
}
