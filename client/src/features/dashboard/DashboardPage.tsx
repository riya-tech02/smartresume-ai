import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  SlidersHorizontal,
  FileText,
  Sparkles,
  LayoutGrid,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { ResumeCard } from './ResumeCard';
import { StatsRow } from './StatsRow';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { useDebounce } from '../../hooks/useDebounce';
import { TEMPLATE_META, TemplateId } from '../../templates/registry';
import type { ResumeSummary, ResumeData } from '@smartresume/shared';

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [sortBy, setSortBy] = useState('updatedAt:desc');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Resume form state
  const [newTitle, setNewTitle] = useState('My Resume');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('minimal-ats');
  const [useSample, setUseSample] = useState(true);

  // Rename modal state
  const [renameTarget, setRenameTarget] = useState<ResumeSummary | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  // Fetch resumes
  const { data, isLoading, isError, refetch } = useQuery<ResumeSummary[]>({
    queryKey: ['resumes', debouncedSearch, sortBy],
    queryFn: async () => {
      const [field, direction] = sortBy.split(':');
      const sortParam = direction === 'asc' ? field : `-${field}`;
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('limit', '50');
      if (sortParam) params.set('sort', sortParam);
      if (debouncedSearch.trim()) {
        params.set('q', debouncedSearch.trim());
      }
      return api.get<ResumeSummary[]>(`/resumes?${params.toString()}`);
    },
  });

  const resumes = useMemo(() => data ?? [], [data]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      return api.post<ResumeData>('/resumes', {
        title: newTitle.trim() || 'Untitled Resume',
        templateId: selectedTemplate,
        useSample,
      });
    },
    onSuccess: (newResume) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setIsNewModalOpen(false);
      navigate(`/builder/${newResume.id}`);
    },
  });

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      return api.patch<ResumeData>(`/resumes/${id}`, { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setRenameTarget(null);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMutation.mutate();
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !renameTitle.trim()) return;
    renameMutation.mutate({ id: renameTarget.id, title: renameTitle.trim() });
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            My Resumes
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Create, manage, and optimize your job-winning resumes with AI.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/templates')}
            leftIcon={<LayoutGrid className="w-4 h-4" />}
          >
            Browse Templates
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setNewTitle('My Resume');
              setSelectedTemplate('minimal-ats');
              setUseSample(true);
              setIsNewModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Resume
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsRow resumes={resumes} />

      {/* Search and Filters Bar */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resumes by title..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-text-muted" />
          <span className="text-xs font-medium text-text-muted">Sort:</span>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-44 text-xs"
          >
            <option value="updatedAt:desc">Recently Updated</option>
            <option value="updatedAt:asc">Oldest First</option>
            <option value="title:asc">Title A-Z</option>
            <option value="atsScore:desc">Highest ATS Score</option>
          </Select>
        </div>
      </div>

      {/* Main Resume Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-text-muted">Loading your resumes...</p>
        </div>
      ) : isError ? (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-8 text-center text-danger">
          <p className="font-semibold">Failed to load resumes</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : resumes.length === 0 ? (
        debouncedSearch ? (
          <EmptyState
            icon={<Search className="w-6 h-6" />}
            title="No matching resumes"
            description={`No resumes found matching "${debouncedSearch}". Try a different search.`}
            actionText="Clear Search"
            onAction={() => setSearch('')}
          />
        ) : (
          <EmptyState
            icon={<FileText className="w-6 h-6" />}
            title="Create your first resume"
            description="Build a high-scoring, ATS-optimized resume tailored to your dream job in minutes."
            actionText="Create New Resume"
            onAction={() => setIsNewModalOpen(true)}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onRefresh={() => refetch()}
              onRename={(target) => {
                setRenameTarget(target);
                setRenameTitle(target.title);
              }}
            />
          ))}
        </div>
      )}

      {/* Create New Resume Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create a New Resume"
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2">
              Resume Title
            </label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2">
              Select Starting Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TEMPLATE_META.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`relative p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                        : 'border-border bg-surface hover:border-text-muted/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-text truncate">
                          {tmpl.name}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted line-clamp-2">
                        {tmpl.description}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-text-muted font-mono uppercase">
                      <span>{tmpl.category}</span>
                      <span>•</span>
                      <span>ATS {tmpl.atsRating}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-sunken p-4 rounded-xl border border-border flex items-start gap-3">
            <input
              id="useSampleCheck"
              type="checkbox"
              checked={useSample}
              onChange={(e) => setUseSample(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="useSampleCheck" className="text-xs text-text cursor-pointer select-none">
              <span className="font-semibold block text-text">
                Start with realistic example content
              </span>
              <span className="text-text-muted block mt-0.5">
                Pre-fills with a senior software engineer profile so you can immediately test
                editing, ATS analysis, and live preview.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Create & Open Builder
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rename Resume Modal */}
      <Modal
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        title="Rename Resume"
        maxWidth="sm"
      >
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2">
              New Title
            </label>
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder="e.g. Staff Engineer 2026"
              required
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={renameMutation.isPending}
            >
              Save Title
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
