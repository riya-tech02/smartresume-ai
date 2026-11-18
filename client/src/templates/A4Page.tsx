import React from 'react';
import { cn } from '../lib/cn.js';
import type { ResumeSettings } from '@smartresume/shared';

export interface A4PageProps {
  settings?: ResumeSettings;
  children: React.ReactNode;
  className?: string;
  showPageBreaks?: boolean;
  estimatedPages?: number;
}

export function A4Page({
  settings,
  children,
  className,
  showPageBreaks = false,
  estimatedPages = 1,
}: A4PageProps) {
  const accentColor = settings?.accentColor || '#4F46E5';
  const fontScale = settings?.fontScale || 'md';
  const spacing = settings?.spacing || 'normal';

  const fontScaleClass =
    fontScale === 'sm' ? 'text-[11px]' : fontScale === 'lg' ? 'text-[13px]' : 'text-[12px]';

  const spacingClass =
    spacing === 'compact' ? 'p-8 space-y-3' : spacing === 'relaxed' ? 'p-12 space-y-5' : 'p-10 space-y-4';

  return (
    <div
      style={{
        ['--resume-accent' as any]: accentColor,
        width: '794px', // 210mm at 96dpi
        minHeight: '1123px', // 297mm at 96dpi
      }}
      className={cn(
        'relative bg-white text-gray-900 shadow-lg mx-auto print:shadow-none print:m-0 print:w-full print:min-h-0',
        fontScaleClass,
        spacingClass,
        className,
      )}
    >
      {/* Page-break guides for live editor view */}
      {showPageBreaks && estimatedPages > 1 && (
        <>
          {Array.from({ length: Math.floor(estimatedPages) }).map((_, i) => (
            <div
              key={i}
              className="page-break-line print:hidden"
              style={{ top: `${(i + 1) * 1123}px` }}
            >
              <span className="page-break-badge">Page {i + 2} Break</span>
            </div>
          ))}
        </>
      )}

      {children}
    </div>
  );
}
