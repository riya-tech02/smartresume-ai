import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Palette, Layout, Download, Check, ShieldCheck, Sparkles, Printer, Loader2 } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { SaveStatusBadge } from './SaveStatus';
import { Button } from '../../components/ui/Button';
import { TEMPLATES } from '@smartresume/shared';
import { api } from '../../lib/api';

interface BuilderHeaderProps {
  onOpenTemplates: () => void;
  onOpenStyles: () => void;
}

export function BuilderHeader({
  onOpenTemplates,
  onOpenStyles,
}: BuilderHeaderProps) {
  const navigate = useNavigate();
  const resume = useEditorStore((s) => s.resume);
  const setTitle = useEditorStore((s) => s.setTitle);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(resume?.title || 'My Resume');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const currentTemplate = TEMPLATES.find(
    (t) => t.id === (resume?.templateId || 'minimal-ats')
  );

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== resume?.title) {
      setTitle(titleInput.trim());
    }
  };

  const handleExportPdf = async () => {
    if (!resume?.id) return;
    setIsExportingPdf(true);
    setExportError(null);

    try {
      // Attempt server-side puppeteer PDF generation
      const blob = await api.postBlob(`/resumes/${resume.id}/pdf`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(resume.title || 'resume').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.warn('Backend PDF export failed, falling back to browser print:', err);
      // Fallback: open print route in new tab
      window.open(`/resumes/${resume.id}/print`, '_blank');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleBrowserPrint = () => {
    if (!resume?.id) return;
    window.open(`/resumes/${resume.id}/print`, '_blank');
  };

  return (
    <header className="h-16 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="p-2 text-text-muted hover:text-text hover:bg-surface-raised rounded-xl transition-colors shrink-0"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className="text-sm font-bold text-text bg-surface-raised border border-primary px-2.5 py-1 rounded-lg outline-hidden w-48 sm:w-64"
              />
              <button
                type="button"
                onClick={handleTitleSubmit}
                className="p-1 text-primary hover:bg-primary/10 rounded"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                setTitleInput(resume?.title || 'My Resume');
                setIsEditingTitle(true);
              }}
              className="group cursor-pointer flex items-center gap-2 min-w-0"
              title="Click to rename"
            >
              <h2 className="text-sm sm:text-base font-bold text-text truncate max-w-[140px] sm:max-w-xs group-hover:text-primary transition-colors">
                {resume?.title || 'My Resume'}
              </h2>
              <span className="text-[10px] text-text-muted border border-border px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Edit
              </span>
            </div>
          )}

          <div className="hidden sm:block">
            <SaveStatusBadge />
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* ATS Score quick pill */}
        <button
          type="button"
          onClick={() => navigate(`/ats?resumeId=${resume?.id}`)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-success/30 bg-success/10 text-success text-xs font-semibold hover:bg-success/20 transition-colors"
          title="Open ATS Analysis"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>ATS Check</span>
        </button>

        {/* AI Assistant shortcut */}
        <button
          type="button"
          onClick={() => navigate(`/assistant?resumeId=${resume?.id}`)}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
          title="Open AI Assistant"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Assistant</span>
        </button>

        {/* Template Selector Drawer Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenTemplates}
          leftIcon={<Layout className="w-4 h-4" />}
          className="text-xs"
        >
          <span className="hidden sm:inline">{currentTemplate?.name || 'Template'}</span>
          <span className="sm:hidden">Template</span>
        </Button>

        {/* Style Settings Drawer Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenStyles}
          leftIcon={<Palette className="w-4 h-4" />}
          className="text-xs"
          title="Styling & Typography"
        >
          <span className="hidden sm:inline">Styles</span>
        </Button>

        {/* Direct Browser Print button */}
        <button
          type="button"
          onClick={handleBrowserPrint}
          className="p-2 text-text-muted hover:text-text hover:bg-surface-raised rounded-xl transition-colors hidden sm:flex items-center"
          title="Print / Save via browser"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Export PDF Button */}
        <Button
          variant="primary"
          size="sm"
          isLoading={isExportingPdf}
          onClick={handleExportPdf}
          leftIcon={<Download className="w-4 h-4" />}
          className="text-xs"
        >
          Export PDF
        </Button>
      </div>
    </header>
  );
}
