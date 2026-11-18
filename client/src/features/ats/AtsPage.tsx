import { useSearchParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ResumePicker } from '../common/ResumePicker';
import { ScoreGauge } from './ScoreGauge';
import { SubScoreBars } from './SubScoreBars';
import { Recommendations } from './Recommendations';
import { CheckList } from './CheckList';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ShieldCheck, RotateCw, Sparkles, AlertCircle } from 'lucide-react';
import type { AtsReport } from '@smartresume/shared';

export function AtsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const selectedResumeId = searchParams.get('resumeId') || '';

  const setSelectedResumeId = (id: string) => {
    setSearchParams({ resumeId: id });
  };

  // Fetch analysis for selected resume
  const { data: analysis, isLoading, isError } = useQuery<AtsReport>({
    queryKey: ['atsAnalysis', selectedResumeId],
    queryFn: async () => {
      // Try to get latest analysis or run one
      return api.post<AtsReport>(`/resumes/${selectedResumeId}/analyze`, {});
    },
    enabled: !!selectedResumeId,
    retry: false,
  });

  // Re-run analysis mutation
  const runMutation = useMutation({
    mutationFn: async () => {
      return api.post<AtsReport>(`/resumes/${selectedResumeId}/analyze`, {});
    },
    onSuccess: (newAnalysis) => {
      queryClient.setQueryData(['atsAnalysis', selectedResumeId], newAnalysis);
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });

  return (
    <div className="space-y-8">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-primary" />
            ATS Score & Optimization Engine
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Audit your resume against Fortune 500 ATS criteria and recruiter parsing models.
          </p>
        </div>

        {/* Resume Selector */}
        <div className="w-full sm:w-72">
          <ResumePicker
            value={selectedResumeId}
            onChange={setSelectedResumeId}
            placeholder="Select a resume to analyze..."
          />
        </div>
      </div>

      {!selectedResumeId ? (
        <div className="bg-surface rounded-2xl border border-dashed border-border p-12 text-center max-w-lg mx-auto">
          <ShieldCheck className="w-12 h-12 text-primary/60 mx-auto mb-3" />
          <h3 className="text-base font-bold text-text">Choose a Resume to Begin</h3>
          <p className="text-xs text-text-muted mt-1">
            Select one of your existing resumes above to inspect its ATS pass rate, keyword density, and formatting health.
          </p>
        </div>
      ) : isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-text-muted">Analyzing resume content and structure...</p>
        </div>
      ) : isError || !analysis ? (
        <div className="bg-surface rounded-2xl border border-border p-8 text-center max-w-md mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-text">No Analysis Found Yet</h3>
            <p className="text-xs text-text-muted mt-1">
              Click below to compute the full ATS audit score for this resume.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => runMutation.mutate()}
            isLoading={runMutation.isPending}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Run ATS Analysis
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Bar with Re-analyze button */}
          <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-border">
            <span className="text-xs text-text-muted">
              Analysis timestamp:{' '}
              <strong className="text-text font-mono">
                {new Date(analysis.createdAt || Date.now()).toLocaleString()}
              </strong>
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={() => runMutation.mutate()}
              isLoading={runMutation.isPending}
              leftIcon={<RotateCw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Re-analyze Now
            </Button>
          </div>

          {/* Scores Overview Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ScoreGauge score={analysis.overall} />
            </div>

            <div className="lg:col-span-2">
              <SubScoreBars scores={analysis.scores} />
            </div>
          </div>

          {/* Recommendations */}
          <Recommendations
            recommendations={analysis.recommendations}
            resumeId={selectedResumeId}
          />

          {/* Detailed Audit Checklist */}
          <CheckList checks={analysis.checks} />
        </div>
      )}
    </div>
  );
}
