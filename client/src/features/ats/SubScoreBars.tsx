import { FileText, KeyRound, Layout, CheckCircle } from 'lucide-react';
import type { AtsReport } from '@smartresume/shared';

interface SubScoreBarsProps {
  scores: AtsReport['scores'];
}

export function SubScoreBars({ scores }: SubScoreBarsProps) {
  const items = [
    {
      label: 'Content & Impact',
      icon: FileText,
      score: scores.content,
      max: 30,
      color: 'bg-emerald-600',
      description: 'Action verbs, quantified metrics, clarity, active voice.',
    },
    {
      label: 'ATS Formatting',
      icon: Layout,
      score: scores.formatting,
      max: 25,
      color: 'bg-blue-600',
      description: 'Standard section headings, dates, contact completeness.',
    },
    {
      label: 'Completeness',
      icon: CheckCircle,
      score: scores.completeness,
      max: 20,
      color: 'bg-purple-600',
      description: 'Required sections present and populated with content.',
    },
    {
      label: 'Skills & Keywords',
      icon: KeyRound,
      score: scores.skills ?? scores.keyword ?? 15,
      max: 25,
      color: 'bg-indigo-600',
      description: 'Hard skills, frameworks, and domain-relevant terminology.',
    },
  ];

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-5">
      <h3 className="text-sm font-bold text-text uppercase tracking-wider">
        Category Breakdown
      </h3>

      <div className="space-y-4">
        {items.map((item) => {
          const pct = Math.min(100, Math.round((item.score / item.max) * 100));
          const Icon = item.icon;

          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-text">
                  <Icon className="w-4 h-4 text-text-muted" />
                  <span>{item.label}</span>
                </div>
                <div className="font-mono text-xs font-bold text-text">
                  <span>{item.score}</span>
                  <span className="text-text-muted font-normal"> / {item.max} pts</span>
                </div>
              </div>

              <div className="h-2 w-full bg-surface-sunken rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p className="text-[11px] text-text-muted">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
