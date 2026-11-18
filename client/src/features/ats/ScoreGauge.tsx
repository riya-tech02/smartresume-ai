import React from 'react';

interface ScoreGaugeProps {
  score: number;
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const rounded = Math.round(score);

  let colorClass = 'text-danger';
  let strokeClass = '#ef4444';
  let badgeClass = 'bg-danger/10 text-danger border-danger/20';
  let verdict = 'Needs Work';

  if (rounded >= 80) {
    colorClass = 'text-success';
    strokeClass = '#10b981';
    badgeClass = 'bg-success/10 text-success border-success/20';
    verdict = 'Excellent (ATS Ready)';
  } else if (rounded >= 65) {
    colorClass = 'text-primary';
    strokeClass = '#4f46e5';
    badgeClass = 'bg-primary/10 text-primary border-primary/20';
    verdict = 'Good (Competitive)';
  } else if (rounded >= 50) {
    colorClass = 'text-amber-500';
    strokeClass = '#f59e0b';
    badgeClass = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    verdict = 'Average (Room to Improve)';
  }

  // Circular progress calculation
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rounded / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-surface rounded-2xl border border-border text-center shadow-xs">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            className="text-surface-sunken"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={strokeClass}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold ${colorClass}`}>
            {rounded}
          </span>
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            out of 100
          </span>
        </div>
      </div>

      <div className={`mt-4 px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
        {verdict}
      </div>

      <p className="text-[11px] text-text-muted mt-2 max-w-[200px]">
        Calculated using real-world enterprise ATS parsing algorithms and heuristic rules.
      </p>
    </div>
  );
}
