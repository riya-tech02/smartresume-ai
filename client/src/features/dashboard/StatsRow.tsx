import React from 'react';
import { Card } from '../../components/ui/Card.js';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';
import type { ResumeSummary } from '@smartresume/shared';

export function StatsRow({ resumes }: { resumes: ResumeSummary[] }) {
  const total = resumes.length;

  const validAtsScores = resumes
    .map((r) => r.lastAtsScore)
    .filter((s): s is number => s !== null);
  const avgAtsScore =
    validAtsScores.length > 0
      ? Math.round(validAtsScores.reduce((a, b) => a + b, 0) / validAtsScores.length)
      : null;

  const needsWorkCount = resumes.filter((r) => r.completion < 60).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Total Resumes
          </span>
          <span className="text-xl font-black text-gray-900">{total} / 20</span>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Average ATS Score
          </span>
          <span className="text-xl font-black text-gray-900">
            {avgAtsScore !== null ? `${avgAtsScore}/100` : 'N/A'}
          </span>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Needs Completion
          </span>
          <span className="text-xl font-black text-gray-900">
            {needsWorkCount} {needsWorkCount === 1 ? 'resume' : 'resumes'} &lt; 60%
          </span>
        </div>
      </Card>
    </div>
  );
}
