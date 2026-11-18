import type { AiSuggestionWarning } from '@smartresume/shared';

/**
 * Fact Guard per PRD AI-R3 and ARCHITECTURE.md §9:
 * Any number, percentage, currency amount, or unsupplied metric in a suggestion
 * that does not appear in the source text triggers a visible warning.
 */
export function checkFacts(
  sourceText: string,
  suggestionText: string,
): AiSuggestionWarning[] {
  const warnings: AiSuggestionWarning[] = [];
  if (!suggestionText) return warnings;

  // Extract numeric tokens: integers, floats, percentages, currencies ($10k, 50%, 10,000)
  const numberPattern = /\b\d+(?:[.,]\d+)?%?|\b(?:\$|€|£|₹)\s*\d+(?:[.,]\d+)?(?:\s*[kKmMbB])?\b/g;

  const sourceNumbers = new Set((sourceText.match(numberPattern) || []).map((s) => s.replace(/\s+/g, '').toLowerCase()));
  const suggestionNumbers = suggestionText.match(numberPattern) || [];

  for (const num of suggestionNumbers) {
    const cleanNum = num.replace(/\s+/g, '').toLowerCase();
    // Allow literal placeholders like [add metric]
    if (!sourceNumbers.has(cleanNum) && !suggestionText.includes('[add metric]')) {
      warnings.push({
        type: 'unsupported_detail',
        value: num,
        message: `Contains figure "${num}" not present in your original text — verify before accepting.`,
      });
    }
  }

  return warnings;
}
