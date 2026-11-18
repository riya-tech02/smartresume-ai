import { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { AiSuggestionCard } from '../../../components/ai/AiSuggestionCard';
import { api } from '../../../lib/api';
import { Sparkles, Loader2 } from 'lucide-react';
import type { SummaryData, AiSuggestionWarning } from '@smartresume/shared';

interface SummaryEditorProps {
  sectionId: string;
}

export function SummaryEditor({ sectionId }: SummaryEditorProps) {
  const section = useEditorStore((s) =>
    s.resume?.sections.find((sec) => sec.id === sectionId)
  );
  const headline = useEditorStore((s) => s.resume?.personalInfo?.headline);
  const updateSectionData = useEditorStore((s) => s.updateSectionData);

  const data = (section?.data || { text: '' }) as SummaryData;
  const currentText = data.text || '';

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    original: string;
    improved: string;
    reason?: string;
    warnings?: AiSuggestionWarning[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (text: string) => {
    updateSectionData(sectionId, { text });
  };

  const handleGenerateSummary = async () => {
    setIsLoadingAi(true);
    setError(null);
    try {
      const res = await api.post<{
        summary: string;
        warnings?: AiSuggestionWarning[];
      }>('/ai/summary', {
        currentSummary: currentText || undefined,
        targetRole: headline || 'Software Engineer',
      });

      if (res.summary) {
        setSuggestion({
          original: currentText,
          improved: res.summary,
          reason: currentText
            ? 'Refined for executive clarity, active voice, and ATS keywords.'
            : 'Generated professional summary based on your profile headline.',
          warnings: res.warnings,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary with AI');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text uppercase tracking-wider">
            Professional Summary
          </h3>
          <p className="text-xs text-text-muted mt-1">
            2-4 punchy sentences highlighting your core competencies, domain experience, and quantified achievements.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isLoadingAi}
          onClick={handleGenerateSummary}
          leftIcon={
            isLoadingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            )
          }
          className="text-xs font-medium"
        >
          {currentText ? 'AI Polish Summary' : 'AI Generate Summary'}
        </Button>
      </div>

      <div className="space-y-3">
        <Textarea
          value={currentText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Results-driven Senior Software Engineer with 7+ years of experience designing resilient distributed systems and high-throughput microservices. Proven track record of scaling platforms to 10M+ MAU..."
          rows={5}
          className="text-xs leading-relaxed"
        />

        <div className="flex items-center justify-between text-[11px] text-text-muted">
          <span>Target length: 40 - 100 words</span>
          <span>
            {currentText.trim() ? currentText.trim().split(/\s+/).length : 0} words
          </span>
        </div>
      </div>

      {error && (
        <p className="text-xs text-danger bg-danger/10 p-2.5 rounded-lg border border-danger/20">
          {error}
        </p>
      )}

      {/* AI Suggestion Card */}
      {suggestion && (
        <AiSuggestionCard
          suggestion={{
            original: suggestion.original,
            improved: suggestion.improved,
            reason: suggestion.reason,
          }}
          warnings={suggestion.warnings}
          onAccept={(improvedText) => {
            handleTextChange(improvedText);
            setSuggestion(null);
          }}
          onReject={() => setSuggestion(null)}
        />
      )}
    </div>
  );
}
