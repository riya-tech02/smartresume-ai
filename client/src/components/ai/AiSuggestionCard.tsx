import React, { useState } from 'react';
import { AiBadge } from './AiBadge.js';
import { DiffText } from './DiffText.js';
import { Button } from '../ui/Button.js';
import { Textarea } from '../ui/Textarea.js';
import { Check, X, Edit3, AlertTriangle } from 'lucide-react';
import type { AiSuggestion, AiSuggestionWarning } from '@smartresume/shared';

export interface AiSuggestionCardProps {
  suggestion: AiSuggestion;
  warnings?: AiSuggestionWarning[];
  onAccept: (improvedText: string) => void;
  onReject: () => void;
}

export function AiSuggestionCard({
  suggestion,
  warnings = [],
  onAccept,
  onReject,
}: AiSuggestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(suggestion.improved);

  const handleSaveAndAccept = () => {
    onAccept(editedText);
    setIsEditing(false);
  };

  return (
    <div className="bg-indigo-50/20 border-2 border-dashed border-indigo-200 rounded-xl p-4 shadow-2xs space-y-3 transition-all hover:border-indigo-300">
      <div className="flex items-center justify-between">
        <AiBadge />
        {suggestion.reason && (
          <span className="text-[11px] text-gray-500 italic max-w-[60%] truncate">
            {suggestion.reason}
          </span>
        )}
      </div>

      {/* Fact Guard Warnings */}
      {warnings.length > 0 && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">Verify Fact Guard Warning:</p>
            {warnings.map((w, i) => (
              <p key={i} className="text-[11px] text-amber-700">
                {w.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Content or Edit mode */}
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={3}
            className="text-xs"
          />
          <div className="flex justify-end gap-1.5">
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleSaveAndAccept}>
              Accept Edited
            </Button>
          </div>
        </div>
      ) : (
        <DiffText original={suggestion.original} improved={suggestion.improved} />
      )}

      {/* Action buttons */}
      {!isEditing && (
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-indigo-100/60">
          <Button
            size="sm"
            variant="ghost"
            onClick={onReject}
            leftIcon={<X className="w-3.5 h-3.5 text-gray-500" />}
            className="text-gray-600 hover:text-gray-900"
          >
            Reject
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            leftIcon={<Edit3 className="w-3.5 h-3.5 text-indigo-600" />}
            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => onAccept(suggestion.improved)}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            Accept
          </Button>
        </div>
      )}
    </div>
  );
}
