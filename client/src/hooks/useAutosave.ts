import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '../store/editorStore.js';
import { api, ApiError } from '../lib/api.js';

export function useAutosave(resumeId?: string) {
  const dirty = useEditorStore((s) => s.dirty);
  const resume = useEditorStore((s) => s.resume);
  const baseRevision = useEditorStore((s) => s.baseRevision);
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus);
  const markSaved = useEditorStore((s) => s.markSaved);
  const setConflict = useEditorStore((s) => s.setConflict);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const backoffRef = useRef<number>(2000);

  const saveResume = useCallback(async () => {
    if (!resume || !dirty || !resumeId) return;

    setSaveStatus('saving');

    try {
      const res = await api.patch<{ revision: number; completion: number }>(`/resumes/${resumeId}`, {
        baseRevision,
        title: resume.title,
        templateId: resume.templateId,
        settings: resume.settings,
        personalInfo: resume.personalInfo,
        sections: resume.sections,
      });

      markSaved(res.revision, res.completion);
      backoffRef.current = 2000; // Reset backoff
    } catch (err: any) {
      if (err instanceof ApiError && err.code === 'CONFLICT_REVISION') {
        const currentRev = (err.details as any)?.currentRevision || baseRevision + 1;
        setConflict(currentRev);
      } else {
        // Network / offline error: retry with exponential backoff
        setSaveStatus('offline');
        const nextDelay = Math.min(backoffRef.current * 2, 30000);
        backoffRef.current = nextDelay;

        timerRef.current = setTimeout(() => {
          saveResume();
        }, nextDelay);
      }
    }
  }, [resume, dirty, resumeId, baseRevision, setSaveStatus, markSaved, setConflict]);

  // Debounced autosave (1500 ms)
  useEffect(() => {
    if (!dirty || !resumeId) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      saveResume();
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dirty, resume, resumeId, saveResume]);

  // Unsaved changes guard: beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  return { saveResume };
}
