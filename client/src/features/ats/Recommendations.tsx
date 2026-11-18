import { useNavigate } from 'react-router';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { Recommendation } from '@smartresume/shared';

interface RecommendationsProps {
  recommendations: Recommendation[];
  resumeId?: string;
}

export function Recommendations({
  recommendations,
  resumeId,
}: RecommendationsProps) {
  const navigate = useNavigate();

  if (recommendations.length === 0) {
    return (
      <div className="bg-success/5 border border-success/20 rounded-2xl p-6 text-center">
        <Sparkles className="w-8 h-8 text-success mx-auto mb-2" />
        <h4 className="text-sm font-bold text-success">
          Outstanding! No Critical Issues Found
        </h4>
        <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
          Your resume meets all our automated ATS standards and best practices.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Top High-Impact Recommendations
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Fix these issues in priority order to maximize your interview callback rate.
          </p>
        </div>

        {resumeId && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/builder/${resumeId}`)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Open in Builder
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => {
          let priorityBadge = 'bg-danger/10 text-danger border-danger/20';
          if (rec.severity === 'medium') {
            priorityBadge = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
          } else if (rec.severity === 'low') {
            priorityBadge = 'bg-blue-500/10 text-blue-600 border-blue-500/20';
          }

          return (
            <div
              key={rec.id}
              className="p-4 rounded-xl border border-border bg-surface-raised flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/30 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityBadge}`}
                  >
                    {rec.severity} priority
                  </span>
                  <span className="text-[11px] font-mono text-text-muted uppercase">
                    {rec.category}
                  </span>
                </div>
                <p className="text-xs text-text font-medium leading-relaxed">
                  {rec.message}
                </p>
                {rec.fix && (
                  <p className="text-[11px] text-text-muted italic">
                    Tip: {rec.fix}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
