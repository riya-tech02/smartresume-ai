import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/cn.js';

export function AiBadge({ className, label = 'AI Suggestion' }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs',
        className,
      )}
    >
      <Sparkles className="w-3 h-3 text-indigo-600 animate-pulse" />
      <span>{label}</span>
    </span>
  );
}
