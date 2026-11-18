import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Trophy,
  Languages,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  MoreVertical,
} from 'lucide-react';
import type { Section, SectionType } from '@smartresume/shared';
import { SECTION_LABELS } from '@smartresume/shared';

interface SectionListProps {
  activeSectionId: string;
  onSelectSection: (id: string) => void;
}

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  personal_info: User,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  projects: FolderGit2,
  certifications: Award,
  achievements: Trophy,
  languages: Languages,
  custom: MoreVertical,
};

const ADDABLE_SECTIONS: { type: SectionType; label: string }[] = [
  { type: 'summary', label: 'Summary' },
  { type: 'experience', label: 'Work Experience' },
  { type: 'education', label: 'Education' },
  { type: 'skills', label: 'Skills' },
  { type: 'projects', label: 'Projects' },
  { type: 'certifications', label: 'Certifications' },
  { type: 'achievements', label: 'Achievements' },
  { type: 'languages', label: 'Languages' },
  { type: 'custom', label: 'Custom Section' },
];

export function SectionList({
  activeSectionId,
  onSelectSection,
}: SectionListProps) {
  const sections = useEditorStore((s) => s.resume?.sections || []);
  const toggleVisibility = useEditorStore((s) => s.toggleSectionVisibility);
  const reorderSections = useEditorStore((s) => s.reorderSections);
  const addSection = useEditorStore((s) => s.addSection);
  const removeSection = useEditorStore((s) => s.removeSection);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const reordered = [...sections];
    const currentItem = reordered[index];
    const targetItem = reordered[targetIndex];
    if (currentItem !== undefined && targetItem !== undefined) {
      reordered[index] = targetItem;
      reordered[targetIndex] = currentItem;
      reorderSections(reordered);
    }
  };

  const handleAdd = (type: SectionType) => {
    addSection(type);
    setShowAddMenu(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Sections
        </span>
      </div>

      <div className="space-y-1.5">
        {/* Fixed Personal Info Item */}
        <button
          type="button"
          onClick={() => onSelectSection('personal_info')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
            activeSectionId === 'personal_info'
              ? 'bg-primary text-white shadow-xs'
              : 'text-text hover:bg-surface-raised border border-transparent'
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          <span className="flex-1 truncate">Personal Information</span>
        </button>

        {/* Dynamic Sections */}
        {sections.map((section, index) => {
          const Icon = SECTION_ICONS[section.type] || FileText;
          const isActive = activeSectionId === section.id;

          return (
            <div
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
                isActive
                  ? 'bg-primary/10 border-primary/30 text-primary font-semibold shadow-2xs'
                  : 'bg-surface border-border text-text hover:border-text-muted/40'
              } ${!section.visible ? 'opacity-60 bg-surface-sunken' : ''}`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-primary' : 'text-text-muted'
                  }`}
                />
                <span className="truncate">
                  {section.title || SECTION_LABELS[section.type] || 'Section'}
                </span>
              </div>

              {/* Action Buttons on Hover */}
              <div className="flex items-center gap-0.5 opacity-90 group-hover:opacity-100">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(index, 'up');
                  }}
                  className="p-1 text-text-muted hover:text-text disabled:opacity-20 rounded"
                  title="Move up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={index === sections.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(index, 'down');
                  }}
                  className="p-1 text-text-muted hover:text-text disabled:opacity-20 rounded"
                  title="Move down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(section.id);
                  }}
                  className="p-1 text-text-muted hover:text-text rounded"
                  title={section.visible ? 'Hide section' : 'Show section'}
                >
                  {section.visible ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-text-muted/60" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTargetId(section.id);
                  }}
                  className="p-1 text-text-muted hover:text-danger rounded"
                  title="Delete section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Section Button with dropdown */}
      <div className="relative pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddMenu(!showAddMenu)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="w-full text-xs font-semibold justify-center"
        >
          Add Section
        </Button>

        {showAddMenu && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowAddMenu(false)}
            />
            <div className="absolute left-0 right-0 bottom-full mb-2 bg-surface rounded-xl border border-border shadow-lg p-1.5 z-30 space-y-0.5">
              {ADDABLE_SECTIONS.map((item) => {
                const Icon = SECTION_ICONS[item.type] || FileText;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleAdd(item.type)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text hover:bg-surface-raised hover:text-primary text-left transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-text-muted" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Confirm Section Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            removeSection(deleteTargetId);
            if (activeSectionId === deleteTargetId) {
              onSelectSection('personal_info');
            }
          }
        }}
        title="Delete this section?"
        message="This will remove the section and all its contents from this resume."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
