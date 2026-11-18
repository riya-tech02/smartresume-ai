import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ResumePicker } from '../common/ResumePicker';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import {
  Briefcase,
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  Copy,
  TrendingUp,
} from 'lucide-react';
import type { JobMatchResult, ResumeData } from '@smartresume/shared';

export function JobMatchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const selectedResumeId = searchParams.get('resumeId') || '';
  const setSelectedResumeId = (id: string) => {
    setSearchParams({ resumeId: id });
  };

  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);

  // Match mutation
  const matchMutation = useMutation({
    mutationFn: async () => {
      return api.post<JobMatchResult>(`/resumes/${selectedResumeId}/match`, {
        jobDescription: jobDescription.trim(),
        targetRole: jobTitle.trim() || undefined,
      });
    },
    onSuccess: (data) => {
      setMatchResult(data);
    },
  });

  // Save tailored copy mutation
  const tailorMutation = useMutation({
    mutationFn: async () => {
      const copy = await api.post<ResumeData>(`/resumes/${selectedResumeId}/duplicate`, {});
      const tailoredTitle = `${jobTitle.trim() || 'Tailored'} - Resume`;
      await api.patch<ResumeData>(`/resumes/${copy.id}`, {
        baseRevision: copy.revision,
        title: tailoredTitle,
      });
      return copy;
    },
    onSuccess: (copy) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      navigate(`/builder/${copy.id}`);
    },
  });

  const handleMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId || !jobDescription.trim()) return;
    matchMutation.mutate();
  };

  const totalKeywords = (matchResult?.matched.length || 0) + (matchResult?.missing.length || 0);
  const matchScore = totalKeywords > 0 ? Math.round(((matchResult?.matched.length || 0) / totalKeywords) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text flex items-center gap-2.5">
            <Target className="w-7 h-7 text-primary" />
            Job Description Matcher
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Compare your resume against any target job posting to find keyword gaps and tailoring recommendations.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <ResumePicker
            value={selectedResumeId}
            onChange={setSelectedResumeId}
            placeholder="Select a resume to compare..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Target Job Details
          </h2>

          <form onSubmit={handleMatch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Target Role / Job Title
              </label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Job Description Text <span className="text-danger">*</span>
              </label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job requirements and qualifications here..."
                rows={12}
                className="text-xs leading-relaxed"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={!selectedResumeId || !jobDescription.trim()}
              isLoading={matchMutation.isPending}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="w-full"
            >
              Analyze Job Match
            </Button>
          </form>
        </div>

        {/* Right Output Area (7 cols) */}
        <div className="lg:col-span-7">
          {!matchResult ? (
            <div className="bg-surface rounded-2xl border border-dashed border-border p-12 text-center">
              <Target className="w-12 h-12 text-primary/60 mx-auto mb-3" />
              <h3 className="text-base font-bold text-text">Ready to Compare</h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                Paste a job description on the left and click "Analyze Job Match" to see your keyword alignment and gaps.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Match Score Card */}
              <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="currentColor"
                        strokeWidth="7"
                        className="text-surface-sunken"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke={matchScore >= 70 ? '#10b981' : matchScore >= 50 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="7"
                        strokeDasharray={2 * Math.PI * 32}
                        strokeDashoffset={2 * Math.PI * 32 * (1 - matchScore / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute font-extrabold text-xl text-text">
                      {matchScore}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-text">
                      Job Keyword Match
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5 max-w-xs leading-relaxed">
                      {matchResult.matched.length} of {totalKeywords} required skills and keywords found in your resume.
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  isLoading={tailorMutation.isPending}
                  onClick={() => tailorMutation.mutate()}
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                  className="shrink-0 text-xs"
                >
                  Save as Tailored Copy
                </Button>
              </div>

              {/* Matched Keywords */}
              <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <h4 className="text-xs font-bold text-text uppercase tracking-wider">
                    Matched Skills & Keywords ({matchResult.matched.length})
                  </h4>
                </div>
                {matchResult.matched.length === 0 ? (
                  <p className="text-xs text-text-muted italic">No matching keywords found.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matched.map((kw) => (
                      <Badge key={kw} variant="success" className="text-xs py-0.5">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Keywords */}
              <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-danger" />
                  <h4 className="text-xs font-bold text-text uppercase tracking-wider">
                    Missing Keywords to Add ({matchResult.missing.length})
                  </h4>
                </div>
                <p className="text-xs text-text-muted">
                  These terms appear prominently in the job posting but are absent from your resume:
                </p>
                {matchResult.missing.length === 0 ? (
                  <p className="text-xs text-success font-medium">All key job terms are present in your resume!</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missing.map((kw) => (
                      <Badge key={kw.term} variant="danger" className="text-xs py-0.5">
                        + {kw.term} ({kw.suggestedSection})
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Section Suggestions */}
              {matchResult.sectionSuggestions && matchResult.sectionSuggestions.length > 0 && (
                <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold text-text uppercase tracking-wider">
                      Targeted Section Recommendations
                    </h4>
                  </div>

                  <div className="space-y-2.5">
                    {matchResult.sectionSuggestions.map((sug, i) => (
                      <div
                        key={i}
                        className="p-3.5 bg-surface-raised rounded-xl border border-border text-xs space-y-1"
                      >
                        <span className="font-semibold text-primary uppercase text-[10px] tracking-wider font-mono">
                          {sug.sectionType}
                        </span>
                        <p className="text-text leading-relaxed">{sug.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
