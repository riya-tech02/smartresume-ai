import React from 'react';
import { Check, Loader2, CloudOff, AlertTriangle } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

export function SaveStatusBadge() {
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);

  if (saveStatus === 'saving') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-muted select-none">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        <span>Saving...</span>
      </div>
    );
  }

  if (saveStatus === 'offline') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full select-none">
        <CloudOff className="w-3.5 h-3.5" />
        <span>Offline (retrying)</span>
      </div>
    );
  }

  if (saveStatus === 'conflict') {
    return (
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="flex items-center gap-1.5 text-xs text-danger bg-danger/10 px-2 py-0.5 rounded-full hover:bg-danger/20 transition-colors"
        title="Another session edited this resume. Click to reload latest."
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Conflict - Click to Reload</span>
      </button>
    );
  }

  // Saved / Idle
  return (
    <div
      className="flex items-center gap-1.5 text-xs text-text-muted select-none"
      title={lastSavedAt ? `Last saved at ${lastSavedAt.toLocaleTimeString()}` : 'All changes saved'}
    >
      <Check className="w-3.5 h-3.5 text-success" />
      <span>Saved</span>
    </div>
  );
}
