import React from 'react';
import { cn } from '../lib/cn.js';
import { formatDateRange } from '../lib/format.js';

export { formatDateRange };

export function SectionHeading({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn('resume-section-heading mb-2 pb-1 border-b border-gray-200', className)} style={style}>
      <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--resume-accent,#4F46E5)]">
        {children}
      </h2>
    </div>
  );
}

export function EntryRow({
  title,
  subtitle,
  date,
  location,
  link,
  className,
}: {
  title: string;
  subtitle?: string;
  date?: string;
  location?: string;
  link?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col mb-1', className)}>
      <div className="flex justify-between items-baseline gap-2">
        <span className="font-bold text-xs text-gray-900 leading-snug">
          {link ? (
            <a href={link} target="_blank" rel="noreferrer" className="hover:underline text-gray-900">
              {title}
            </a>
          ) : (
            title
          )}
        </span>
        {date && <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">{date}</span>}
      </div>
      {(subtitle || location) && (
        <div className="flex justify-between items-baseline text-[11px] text-gray-600">
          {subtitle && <span className="italic">{subtitle}</span>}
          {location && <span className="text-gray-500 text-[10px]">{location}</span>}
        </div>
      )}
    </div>
  );
}

export function BulletList({ bullets }: { bullets: string[] }) {
  if (!bullets || bullets.length === 0) return null;

  return (
    <ul className="list-disc list-outside ml-4 space-y-1 mt-1 text-[11px] text-gray-700 leading-normal">
      {bullets.map((b, i) => (
        <li key={i} className="pl-0.5">
          {b}
        </li>
      ))}
    </ul>
  );
}

export function TagLine({ label, tags }: { label?: string; tags: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="text-[11px] text-gray-700 mt-1">
      {label && <span className="font-semibold text-gray-800 mr-1">{label}:</span>}
      <span>{tags.join(', ')}</span>
    </div>
  );
}
