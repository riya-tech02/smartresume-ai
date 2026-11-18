import React from 'react';
import { AlertCircle } from 'lucide-react';

export function FallbackBanner({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
      <span>{message || 'AI provider is unavailable — showing high-quality rule-based suggestions.'}</span>
    </div>
  );
}
