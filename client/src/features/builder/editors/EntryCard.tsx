import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, GripVertical } from 'lucide-react';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

interface EntryCardProps {
  title: string;
  subtitle?: string;
  dateRange?: string;
  defaultExpanded?: boolean;
  onDelete: () => void;
  children: React.ReactNode;
}

export function EntryCard({
  title,
  subtitle,
  dateRange,
  defaultExpanded = true,
  onDelete,
  children,
}: EntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  return (
    <div className="bg-surface border border-border rounded-xl shadow-2xs overflow-hidden transition-all duration-200">
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-surface-raised cursor-pointer select-none border-b border-border/50 hover:bg-surface-sunken/60 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <GripVertical className="w-4 h-4 text-text-muted shrink-0 cursor-grab" />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-text truncate">
              {title || 'Untitled Entry'}
            </h4>
            {(subtitle || dateRange) && (
              <p className="text-[11px] text-text-muted truncate">
                {subtitle}
                {subtitle && dateRange ? ' • ' : ''}
                {dateRange}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmDelete(true);
            }}
            title="Delete entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-1.5 text-text-muted hover:text-text rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Body content */}
      {isExpanded && <div className="p-4 space-y-4">{children}</div>}

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={onDelete}
        title="Delete this entry?"
        message="This will permanently delete this item from your resume."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
