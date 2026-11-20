import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { AiSuggestionCard } from '../../../components/ai/AiSuggestionCard';
import { requestAiSuggestion } from '../../assistant/aiApi';
import { getErrorMessage } from '../../../lib/errors';
import type { AiSuggestionWarning } from '@smartresume/shared';
import { useEditorStore } from '../../../store/editorStore';

interface BulletListEditorProps {
  bullets: string[];
  onChange: (bullets: string[]) => void;
  label?: string;
  placeholder?: string;
  targetRole?: string;
}

export function BulletListEditor({
  bullets,
  onChange,
  label = 'Key Achievements & Responsibilities',
  placeholder = 'Describe a major contribution with quantified impact (e.g. Led migration to Next.js reducing LCP by 45%)...',
  targetRole,
}: BulletListEditorProps) {
  const resumeId = useEditorStore((s) => s.resume?.id);
  const [activeAiIndex, setActiveAiIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState<{
    index: number;
    improved: string;
    original: string;
    reason?: string;
    warnings?: AiSuggestionWarning[];
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAdd = () => {
    onChange([...bullets, '']);
  };

  const handleUpdate = (index: number, val: string) => {
    const updated = [...bullets];
    updated[index] = val;
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    if (activeAiIndex === index) {
      setActiveAiIndex(null);
      setSuggestion(null);
    }
    onChange(bullets.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= bullets.length) return;
    const updated = [...bullets];
    const currentItem = updated[index];
    const targetItem = updated[targetIndex];
    if (currentItem !== undefined && targetItem !== undefined) {
      updated[index] = targetItem;
      updated[targetIndex] = currentItem;
      onChange(updated);
    }
  };

  const handleImproveWithAi = async (index: number) => {
    const text = bullets[index];
    if (!text || text.trim().length < 5) return;

    setLoadingIndex(index);
    setAiError(null);
    try {
      if (!resumeId) throw new Error('Save the resume before requesting an AI suggestion.');
      const res = await requestAiSuggestion({
        feature: 'improve-bullets',
        resumeId,
        payload: {
          context: targetRole || '',
          bullets: [text],
        },
      });

      const first = res.suggestions?.[0];
      if (first) {
        setSuggestion({
          index,
          original: first.original || text,
          improved: first.improved,
          reason: first.reason,
          warnings: res.meta.warnings,
        });
        setActiveAiIndex(index);
      }
    } catch (err: unknown) {
      setAiError(getErrorMessage(err, 'Failed to get AI improvement'));
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-text uppercase tracking-wider">
          {label}
        </label>
        <span className="text-[11px] text-text-muted">
          {bullets.length} {bullets.length === 1 ? 'bullet' : 'bullets'}
        </span>
      </div>

      <div className="space-y-2.5">
        {bullets.map((bullet, index) => {
          const isLoadingAi = loadingIndex === index;
          const isShowingSuggestion = suggestion?.index === index;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-start gap-2 group">
                <span className="text-xs text-text-muted mt-2 select-none font-mono">
                  •
                </span>
                <div className="flex-1">
                  <Textarea
                    value={bullet}
                    onChange={(e) => handleUpdate(index, e.target.value)}
                    placeholder={placeholder}
                    rows={2}
                    className="text-xs leading-relaxed"
                  />
                </div>

                {/* Actions rail */}
                <div className="flex flex-col gap-1 items-center pt-0.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1 text-text-muted hover:text-text disabled:opacity-20 rounded transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === bullets.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1 text-text-muted hover:text-text disabled:opacity-20 rounded transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="p-1 text-text-muted hover:text-danger rounded transition-colors"
                      title="Delete bullet"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isLoadingAi || !bullet || bullet.trim().length < 5}
                    onClick={() => handleImproveWithAi(index)}
                    className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded transition-colors disabled:opacity-40"
                    title="Improve with AI (Action verbs, metrics, impact)"
                  >
                    {isLoadingAi ? (
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-2.5 h-2.5" />
                    )}
                    <span>AI Polish</span>
                  </button>
                </div>
              </div>

              {/* AI Suggestion diff card */}
              {isShowingSuggestion && suggestion && (
                <div className="pl-5">
                  <AiSuggestionCard
                    suggestion={{
                      original: suggestion.original,
                      improved: suggestion.improved,
                      reason: suggestion.reason,
                    }}
                    warnings={suggestion.warnings}
                    onAccept={(improvedText) => {
                      handleUpdate(index, improvedText);
                      setSuggestion(null);
                      setActiveAiIndex(null);
                    }}
                    onReject={() => {
                      setSuggestion(null);
                      setActiveAiIndex(null);
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {aiError && (
        <p className="text-xs text-danger bg-danger/10 p-2 rounded-md">
          {aiError}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        leftIcon={<Plus className="w-3.5 h-3.5" />}
        className="w-full text-xs"
      >
        Add Bullet Point
      </Button>
    </div>
  );
}
