import React from 'react';

export function DiffText({ original, improved }: { original?: string; improved: string }) {
  if (!original) {
    return <p className="text-xs text-gray-800 leading-relaxed font-medium">{improved}</p>;
  }

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      <div className="text-gray-400 line-through bg-gray-50 p-2 rounded-md border border-gray-100">
        {original}
      </div>
      <div className="text-gray-900 font-medium bg-emerald-50/40 p-2 rounded-md border border-emerald-100/60">
        {improved}
      </div>
    </div>
  );
}
