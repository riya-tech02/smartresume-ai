import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface ActionVerbsData {
  categories: Record<string, string[]>;
  all: string[];
}

let verbsCache: ActionVerbsData | null = null;

export function getActionVerbsData(): ActionVerbsData {
  if (!verbsCache) {
    try {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const p = path.resolve(currentDir, '../../ats/data/action-verbs.json');
      verbsCache = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch {
      verbsCache = {
        categories: {
          development: ['Architected', 'Engineered', 'Developed', 'Implemented', 'Built'],
          optimization: ['Optimized', 'Streamlined', 'Accelerated', 'Enhanced'],
          leadership: ['Spearheaded', 'Directed', 'Orchestrated', 'Led'],
        },
        all: ['architected', 'engineered', 'developed', 'implemented', 'built', 'optimized', 'spearheaded'],
      };
    }
  }
  return verbsCache!;
}

export function suggestActionVerbs(category?: string): string[] {
  const data = getActionVerbsData();
  if (category && data.categories[category]) {
    return data.categories[category]!;
  }
  return Object.values(data.categories).flat().slice(0, 15);
}
