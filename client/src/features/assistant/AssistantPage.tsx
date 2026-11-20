import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ResumePicker } from '../common/ResumePicker';
import { requestAiSuggestion } from './aiApi';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { AiSuggestionCard } from '../../components/ai/AiSuggestionCard';
import { ConsentDialog } from '../../components/ai/ConsentDialog';
import { getErrorMessage } from '../../lib/errors';
import {
  Sparkles,
  FileText,
  ListCheck,
  FolderGit2,
  Wrench,
  Trophy,
  SpellCheck,
  Target,
  Copy,
  Check,
} from 'lucide-react';
import type { AiFeature, AiStatus, ResumeData, AiSuggestionWarning } from '@smartresume/shared';

type ToolId =
  | 'summary'
  | 'bullets'
  | 'project'
  | 'skills'
  | 'achievements'
  | 'grammar'
  | 'tailor';

export function AssistantPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedResumeId = searchParams.get('resumeId') || '';

  const setSelectedResumeId = (id: string) => {
    setSearchParams({ resumeId: id });
  };

  const [activeTool, setActiveTool] = useState<ToolId>('summary');

  // Input states
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [inputText, setInputText] = useState('');
  const [secondaryText, setSecondaryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);

  // Result state
  const [result, setResult] = useState<{
    original: string;
    improved: string;
    reason?: string;
    warnings?: AiSuggestionWarning[];
  } | null>(null);

  // Optionally load resume to prepopulate
  const { data: resume } = useQuery<ResumeData>({
    queryKey: ['resume', selectedResumeId],
    queryFn: async () => api.get<ResumeData>(`/resumes/${selectedResumeId}`),
    enabled: !!selectedResumeId,
  });
  const {
    data: aiStatus,
    isError: isStatusError,
    refetch: refetchAiStatus,
  } = useQuery<AiStatus>({
    queryKey: ['ai', 'status'],
    queryFn: () => api.get<AiStatus>('/ai/status'),
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError('Select a resume before requesting an AI suggestion.');
      return;
    }
    if (isStatusError || !aiStatus) {
      setError('Unable to check AI availability. Please retry.');
      return;
    }
    if (!aiStatus.consentAccepted) {
      setIsConsentOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { feature, payload } = getToolRequest(activeTool, {
        inputText,
        secondaryText,
        targetRole,
      });
      const response = await requestAiSuggestion({
        feature,
        resumeId: selectedResumeId,
        payload,
      });
      const suggestions = response.suggestions;
      const firstSuggestion = suggestions[0];
      setResult({
        original: firstSuggestion?.original || inputText,
        improved: suggestions.map((suggestion) => suggestion.improved).join('\n\n'),
        reason: suggestions.map((suggestion) => suggestion.reason).filter(Boolean).join(' '),
        warnings: response.meta.warnings,
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'AI request failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tools: { id: ToolId; name: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'summary', name: 'Summary Generator', icon: FileText },
    { id: 'bullets', name: 'Bullet Enhancer', icon: ListCheck },
    { id: 'project', name: 'Project Rewriter', icon: FolderGit2 },
    { id: 'skills', name: 'Skill Suggester', icon: Wrench },
    { id: 'achievements', name: 'Quantify Metrics', icon: Trophy },
    { id: 'grammar', name: 'Grammar & Clarity', icon: SpellCheck },
    { id: 'tailor', name: 'Job Tailor', icon: Target },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-primary" />
            AI Resume Assistant
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Generate, polish, and quantify your resume sections with built-in Fact Guard and ATS keyword matching.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <ResumePicker
            value={selectedResumeId}
            onChange={setSelectedResumeId}
            placeholder="Select a resume..."
          />
          {resume && (
            <p className="mt-1 text-[11px] text-text-muted">
              Context loaded: {resume.title}
            </p>
          )}
        </div>
      </div>

      {/* Tools Nav Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-border">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id);
                setResult(null);
                setError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface text-text hover:bg-surface-raised border border-border'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tool.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form and Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input (5 cols) */}
        <div className="lg:col-span-5 bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Target Job Title / Domain
              </label>
              <Input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                required
              />
            </div>

            {activeTool === 'project' && (
              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Technologies / Frameworks (comma separated)
                </label>
                <Input
                  value={secondaryText}
                  onChange={(e) => setSecondaryText(e.target.value)}
                  placeholder="e.g. React 19, Vite, Tailwind CSS"
                />
              </div>
            )}

            {activeTool === 'tailor' && (
              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Target Job Description
                </label>
                <Textarea
                  value={secondaryText}
                  onChange={(e) => setSecondaryText(e.target.value)}
                  placeholder="Paste the target job qualifications here..."
                  rows={4}
                  className="text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                {activeTool === 'summary' && 'Current Summary (or leave empty to generate from scratch)'}
                {activeTool === 'bullets' && 'Draft Bullet Point to Enhance'}
                {activeTool === 'project' && 'Project Summary / Rough Notes'}
                {activeTool === 'skills' && 'Current Skills (comma separated)'}
                {activeTool === 'achievements' && 'Role Context or Raw Accomplishment'}
                {activeTool === 'grammar' && 'Resume Text to Review'}
                {activeTool === 'tailor' && 'Your Resume Highlights'}
              </label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  activeTool === 'bullets'
                    ? 'e.g. worked on website performance and made it faster'
                    : 'Enter draft text here...'
                }
                rows={7}
                className="text-xs leading-relaxed"
                required={activeTool !== 'summary'}
              />
            </div>

            {error && (
              <p className="text-xs text-danger bg-danger/10 p-2.5 rounded-lg border border-danger/20">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading || !aiStatus}
              disabled={!selectedResumeId || !aiStatus}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="w-full"
            >
              Generate AI Recommendation
            </Button>
          </form>
        </div>

        {/* Right Output (7 cols) */}
        <div className="lg:col-span-7">
          {!result ? (
            <div className="bg-surface rounded-2xl border border-dashed border-border p-12 text-center">
              <Sparkles className="w-12 h-12 text-primary/60 mx-auto mb-3" />
              <h3 className="text-base font-bold text-text">AI Powered Suggestions</h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                Fill in the details on the left to receive polished, ATS-optimized suggestions with Diff analysis and Fact Guard safety.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text uppercase tracking-wider">
                  AI Suggestion Result
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(result.improved)}
                  leftIcon={copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
              </div>

              <AiSuggestionCard
                suggestion={{
                  original: result.original,
                  improved: result.improved,
                  reason: result.reason,
                }}
                warnings={result.warnings}
                onAccept={(improvedText) => handleCopy(improvedText)}
                onReject={() => setResult(null)}
              />
            </div>
          )}
        </div>
      </div>
      <ConsentDialog
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
        onConsentSuccess={() => void refetchAiStatus()}
      />
    </div>
  );
}

function getToolRequest(
  tool: ToolId,
  input: { inputText: string; secondaryText: string; targetRole: string },
): { feature: AiFeature; payload: Record<string, unknown> } {
  const splitList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

  switch (tool) {
    case 'summary':
      return {
        feature: 'summary',
        payload: { currentSummary: input.inputText, headline: input.targetRole },
      };
    case 'bullets':
      return {
        feature: 'improve-bullets',
        payload: { context: input.targetRole, bullets: [input.inputText] },
      };
    case 'project':
      return {
        feature: 'rewrite-project',
        payload: {
          projectName: input.targetRole || 'Project',
          description: input.inputText,
          techStack: splitList(input.secondaryText),
        },
      };
    case 'skills':
      return {
        feature: 'suggest-skills',
        payload: { targetRole: input.targetRole, existingSkills: splitList(input.inputText) },
      };
    case 'achievements':
      return { feature: 'achievements', payload: { description: input.inputText } };
    case 'grammar':
      return { feature: 'grammar', payload: { text: input.inputText } };
    case 'tailor':
      return {
        feature: 'tailor',
        payload: { text: input.inputText, jobDescription: input.secondaryText },
      };
  }
}
