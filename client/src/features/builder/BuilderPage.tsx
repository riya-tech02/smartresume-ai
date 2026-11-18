import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useEditorStore } from '../../store/editorStore';
import { useAutosave } from '../../hooks/useAutosave';
import { BuilderHeader } from './BuilderHeader';
import { SectionList } from './SectionList';
import { TemplateDrawer } from './TemplateDrawer';
import { StyleSettings } from './StyleSettings';
import { A4Page } from '../../templates/A4Page';
import { getTemplateComponent } from '../../templates/registry';
import { Spinner } from '../../components/ui/Spinner';
import { Segmented } from '../../components/ui/Segmented';
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

// Editors
import { PersonalInfoEditor } from './editors/PersonalInfoEditor';
import { SummaryEditor } from './editors/SummaryEditor';
import { ExperienceEditor } from './editors/ExperienceEditor';
import { EducationEditor } from './editors/EducationEditor';
import { SkillsEditor } from './editors/SkillsEditor';
import { ProjectsEditor } from './editors/ProjectsEditor';
import { CertificationsEditor } from './editors/CertificationsEditor';
import { AchievementsEditor } from './editors/AchievementsEditor';
import { LanguagesEditor } from './editors/LanguagesEditor';
import { CustomEditor } from './editors/CustomEditor';

import type { ResumeData } from '@smartresume/shared';

export function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const resume = useEditorStore((s) => s.resume);
  const setResume = useEditorStore((s) => s.setResume);
  const conflictRevision = useEditorStore((s) => s.conflictRevision);

  const [activeSectionId, setActiveSectionId] = useState<string>('personal_info');
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isStylesOpen, setIsStylesOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [zoom, setZoom] = useState(0.85);

  // Autosave hook
  useAutosave(id);

  // Fetch resume data
  const { data, isLoading, isError, error } = useQuery<ResumeData>({
    queryKey: ['resume', id],
    queryFn: async () => {
      return api.get<ResumeData>(`/resumes/${id}`);
    },
    enabled: !!id,
  });

  // Populate store when data loads
  useEffect(() => {
    if (data) {
      setResume(data);
    }
  }, [data, setResume]);

  // Selected section
  const currentSection = useMemo(() => {
    if (activeSectionId === 'personal_info') return null;
    return resume?.sections.find((s) => s.id === activeSectionId) || null;
  }, [resume?.sections, activeSectionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-surface-sunken">
        <Spinner size="lg" />
        <p className="text-xs text-text-muted">Loading your resume...</p>
      </div>
    );
  }

  if (isError || !resume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface-sunken p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-danger" />
        <h2 className="text-lg font-bold text-text">Failed to load resume</h2>
        <p className="text-xs text-text-muted max-w-sm">
          {(error as any)?.message || 'The requested resume could not be found.'}
        </p>
        <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // Resolve template component
  const TemplateComponent = getTemplateComponent(resume.templateId);

  return (
    <div className="min-h-screen flex flex-col bg-surface-sunken">
      {/* Top Header */}
      <BuilderHeader
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenStyles={() => setIsStylesOpen(true)}
      />

      {/* Revision Conflict Banner */}
      {conflictRevision && (
        <div className="bg-danger/10 border-b border-danger/20 px-6 py-2.5 flex items-center justify-between text-danger text-xs">
          <span>
            A newer revision (r{conflictRevision}) was saved from another tab or device.
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
            className="text-xs"
          >
            Reload Latest
          </Button>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden p-3 bg-surface border-b border-border flex justify-center">
        <Segmented
          options={[
            { value: 'edit', label: 'Editor' },
            { value: 'preview', label: 'Live Preview' },
          ]}
          value={mobileTab}
          onChange={(val) => setMobileTab(val as 'edit' | 'preview')}
          className="w-64"
        />
      </div>

      {/* Main 3-Pane Work Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Pane 1: Section List Rail (Left) */}
        <aside
          className={`w-full lg:w-64 bg-surface border-r border-border p-4 overflow-y-auto shrink-0 ${
            mobileTab === 'edit' ? 'block' : 'hidden lg:block'
          }`}
        >
          <SectionList
            activeSectionId={activeSectionId}
            onSelectSection={(secId) => {
              setActiveSectionId(secId);
              // On mobile, keep in edit view
            }}
          />
        </aside>

        {/* Pane 2: Active Section Editor (Middle) */}
        <main
          className={`flex-1 bg-surface-raised p-4 sm:p-8 overflow-y-auto ${
            mobileTab === 'edit' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="max-w-2xl mx-auto bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
            {activeSectionId === 'personal_info' && <PersonalInfoEditor />}

            {currentSection && currentSection.type === 'summary' && (
              <SummaryEditor sectionId={currentSection.id} />
            )}

            {currentSection && currentSection.type === 'experience' && (
              <ExperienceEditor sectionId={currentSection.id} />
            )}

            {currentSection && currentSection.type === 'education' && (
              <EducationEditor sectionId={currentSection.id} />
            )}

            {currentSection && currentSection.type === 'skills' && (
              <SkillsEditor sectionId={currentSection.id} />
            )}

            {currentSection && currentSection.type === 'projects' && (
              <ProjectsEditor sectionId={currentSection.id} />
            )}

            {currentSection && currentSection.type === 'certifications' && (
              <CertificationsEditor sectionId={currentSection.id} />
            )}

            {currentSection && currentSection.type === 'achievements' && (
              <AchievementsEditor sectionId={currentSection.id} />
            )}

            {currentSection && currentSection.type === 'languages' && (
              <LanguagesEditor sectionId={currentSection.id} />
            )}

            {currentSection && currentSection.type === 'custom' && (
              <CustomEditor sectionId={currentSection.id} />
            )}
          </div>
        </main>

        {/* Pane 3: Live Preview (Right) */}
        <section
          className={`flex-1 bg-surface-sunken p-4 sm:p-8 overflow-y-auto flex flex-col items-center ${
            mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Zoom controls */}
          <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border border-border/80 rounded-full px-3 py-1.5 shadow-xs flex items-center gap-2 mb-6 text-xs text-text-muted">
            <button
              type="button"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-1 hover:text-text rounded-full hover:bg-surface-raised transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(Math.min(1.4, zoom + 0.1))}
              className="p-1 hover:text-text rounded-full hover:bg-surface-raised transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(0.85)}
              className="p-1 hover:text-text rounded-full hover:bg-surface-raised transition-colors border-l border-border pl-2"
              title="Reset zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Scaled A4 Resume Page */}
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <TemplateComponent
              resume={resume}
              showPageBreaks={true}
            />
          </div>
        </section>
      </div>

      {/* Drawers */}
      <TemplateDrawer
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
      />

      <StyleSettings
        isOpen={isStylesOpen}
        onClose={() => setIsStylesOpen(false)}
      />
    </div>
  );
}
