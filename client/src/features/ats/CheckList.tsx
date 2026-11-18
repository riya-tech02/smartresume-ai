import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { AtsCheck } from '@smartresume/shared';

interface CheckListProps {
  checks: AtsCheck[];
}

export function CheckList({ checks }: CheckListProps) {
  const [filter, setFilter] = useState<string>('all');

  const filtered = checks.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'issues') return !c.passed;
    return c.category === filter;
  });

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-text uppercase tracking-wider">
            Detailed ATS Audit Checks
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Individual tests run by the parser against your resume data.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'issues', label: 'Issues Only' },
            { id: 'content', label: 'Content' },
            { id: 'formatting', label: 'Formatting' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-sunken text-text-muted hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border/60">
        {filtered.map((check) => {
          return (
            <div key={check.id} className="py-3 flex items-start gap-3">
              {check.passed ? (
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-text truncate">
                    {check.label}
                  </h4>
                  <span className="text-[11px] font-mono font-semibold text-text-muted shrink-0">
                    {check.score} pts
                  </span>
                </div>

                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                  {check.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
