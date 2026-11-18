import { create } from 'zustand';
import type {
  ResumeData,
  PersonalInfo,
  Section,
  SectionType,
  TemplateId,
  ResumeSettings,
} from '@smartresume/shared';
import { calculateCompleteness, SECTION_LABELS } from '@smartresume/shared';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'conflict';

interface EditorState {
  resume: ResumeData | null;
  baseRevision: number;
  dirty: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  conflictRevision: number | null;

  // Actions
  setResume: (resume: ResumeData) => void;
  setTitle: (title: string) => void;
  setTemplateId: (templateId: TemplateId) => void;
  updateSettings: (settings: Partial<ResumeSettings>) => void;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateSectionData: (sectionId: string, data: unknown) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  renameSection: (sectionId: string, newTitle: string) => void;
  reorderSections: (newSections: Section[]) => void;
  addSection: (type: SectionType, customTitle?: string) => void;
  removeSection: (sectionId: string) => void;

  setSaveStatus: (status: SaveStatus) => void;
  markSaved: (newRevision: number, completion: number) => void;
  setConflict: (currentRevision: number) => void;
  clearDirty: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  resume: null,
  baseRevision: 1,
  dirty: false,
  saveStatus: 'idle',
  lastSavedAt: null,
  conflictRevision: null,

  setResume: (resume) =>
    set({
      resume,
      baseRevision: resume.revision,
      dirty: false,
      saveStatus: 'saved',
      lastSavedAt: new Date(),
      conflictRevision: null,
    }),

  setTitle: (title) => {
    const resume = get().resume;
    if (!resume) return;
    set({
      resume: { ...resume, title },
      dirty: true,
      saveStatus: 'idle',
    });
  },

  setTemplateId: (templateId) => {
    const resume = get().resume;
    if (!resume) return;
    set({
      resume: { ...resume, templateId },
      dirty: true,
      saveStatus: 'idle',
    });
  },

  updateSettings: (partialSettings) => {
    const resume = get().resume;
    if (!resume) return;
    set({
      resume: {
        ...resume,
        settings: { ...resume.settings, ...partialSettings },
      },
      dirty: true,
      saveStatus: 'idle',
    });
  },

  updatePersonalInfo: (info) => {
    const resume = get().resume;
    if (!resume) return;
    const newPersonalInfo = { ...resume.personalInfo, ...info };
    const completion = calculateCompleteness(newPersonalInfo, resume.sections);
    set({
      resume: {
        ...resume,
        personalInfo: newPersonalInfo,
        completion,
      },
      dirty: true,
      saveStatus: 'idle',
    });
  },

  updateSectionData: (sectionId, data) => {
    const resume = get().resume;
    if (!resume) return;
    const newSections = resume.sections.map((s) => (s.id === sectionId ? ({ ...s, data } as Section) : s));
    const completion = calculateCompleteness(resume.personalInfo, newSections);
    set({
      resume: {
        ...resume,
        sections: newSections,
        completion,
      },
      dirty: true,
      saveStatus: 'idle',
    });
  },

  toggleSectionVisibility: (sectionId) => {
    const resume = get().resume;
    if (!resume) return;
    const newSections = resume.sections.map((s) => (s.id === sectionId ? { ...s, visible: !s.visible } : s));
    const completion = calculateCompleteness(resume.personalInfo, newSections);
    set({
      resume: {
        ...resume,
        sections: newSections,
        completion,
      },
      dirty: true,
      saveStatus: 'idle',
    });
  },

  renameSection: (sectionId, newTitle) => {
    const resume = get().resume;
    if (!resume) return;
    const newSections = resume.sections.map((s) => (s.id === sectionId ? { ...s, title: newTitle } : s));
    set({
      resume: {
        ...resume,
        sections: newSections,
      },
      dirty: true,
      saveStatus: 'idle',
    });
  },

  reorderSections: (newSections) => {
    const resume = get().resume;
    if (!resume) return;
    set({
      resume: {
        ...resume,
        sections: newSections,
      },
      dirty: true,
      saveStatus: 'idle',
    });
  },

  addSection: (type, customTitle) => {
    const resume = get().resume;
    if (!resume) return;

    let initialData: unknown;
    switch (type) {
      case 'summary':
        initialData = { text: '' };
        break;
      case 'skills':
        initialData = { groups: [] };
        break;
      default:
        initialData = { entries: [] };
        break;
    }

    const newSection: Section = {
      id: `sec_${type}_${crypto.randomUUID().slice(0, 8)}`,
      type,
      title: customTitle || SECTION_LABELS[type] || 'New Section',
      visible: true,
      data: initialData,
    } as Section;

    const newSections = [...resume.sections, newSection];
    const completion = calculateCompleteness(resume.personalInfo, newSections);
    set({
      resume: {
        ...resume,
        sections: newSections,
        completion,
      },
      dirty: true,
      saveStatus: 'idle',
    });
  },

  removeSection: (sectionId) => {
    const resume = get().resume;
    if (!resume) return;
    const newSections = resume.sections.filter((s) => s.id !== sectionId);
    const completion = calculateCompleteness(resume.personalInfo, newSections);
    set({
      resume: {
        ...resume,
        sections: newSections,
        completion,
      },
      dirty: true,
      saveStatus: 'idle',
    });
  },

  setSaveStatus: (saveStatus) => set({ saveStatus }),

  markSaved: (newRevision, completion) => {
    const resume = get().resume;
    if (!resume) return;
    set({
      baseRevision: newRevision,
      resume: { ...resume, revision: newRevision, completion },
      dirty: false,
      saveStatus: 'saved',
      lastSavedAt: new Date(),
      conflictRevision: null,
    });
  },

  setConflict: (currentRevision) =>
    set({
      saveStatus: 'conflict',
      conflictRevision: currentRevision,
    }),

  clearDirty: () => set({ dirty: false }),
}));
