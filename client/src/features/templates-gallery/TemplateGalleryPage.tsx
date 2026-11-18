import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TEMPLATE_META, TemplateId } from '../../templates/registry';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ShieldCheck, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import type { ResumeData } from '@smartresume/shared';

export function TemplateGalleryPage() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);
  const [title, setTitle] = useState('My Resume');
  const [useSample, setUseSample] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    setIsCreating(true);

    try {
      const res = await api.post<ResumeData>('/resumes', {
        title: title.trim() || 'My Resume',
        templateId: selectedTemplate,
        useSample,
      });
      navigate(`/builder/${res.id}`);
    } catch (err: any) {
      console.error(err);
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
          ATS-Optimized Resume Templates
        </h1>
        <p className="text-sm text-text-muted mt-1 max-w-2xl">
          Crafted to meet the strictest ATS parsing requirements while maintaining
          clean, modern aesthetics that human hiring managers love.
        </p>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {TEMPLATE_META.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-surface rounded-2xl border border-border p-6 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-text">{tmpl.name}</h3>
                  <span className="text-xs font-mono uppercase text-text-muted">
                    {tmpl.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-success/10 border border-success/30 rounded-full text-success text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ATS {tmpl.atsRating}%</span>
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                {tmpl.description}
              </p>

              {/* Best for tags */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-text uppercase tracking-wider block">
                  Best Suited For:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tmpl.bestFor.map((role) => (
                    <Badge key={role} variant="neutral" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
              <span className="text-xs text-text-muted flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                100% ATS Compliant
              </span>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedTemplate(tmpl.id);
                  setTitle(`My ${tmpl.name}`);
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Use Template
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        title="Start Building with this Template"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2">
              Resume Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              required
              autoFocus
            />
          </div>

          <div className="bg-surface-sunken p-4 rounded-xl border border-border flex items-start gap-3">
            <input
              id="useSampleGallery"
              type="checkbox"
              checked={useSample}
              onChange={(e) => setUseSample(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="useSampleGallery" className="text-xs text-text cursor-pointer select-none">
              <span className="font-semibold block text-text">
                Pre-populate with example content
              </span>
              <span className="text-text-muted block mt-0.5">
                Includes sample tech experience, projects, skills, and summary.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedTemplate(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Open in Builder
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
