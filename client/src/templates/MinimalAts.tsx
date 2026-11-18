import React from 'react';
import { A4Page } from './A4Page.js';
import { SectionHeading, EntryRow, BulletList, formatDateRange } from './primitives.js';
import type { ResumeData, Section } from '@smartresume/shared';

export function MinimalAtsTemplate({
  resume,
  showPageBreaks,
  estimatedPages,
}: {
  resume: ResumeData;
  showPageBreaks?: boolean;
  estimatedPages?: number;
}) {
  const { personalInfo, sections, settings } = resume;
  const visibleSections = (sections || []).filter((s) => s.visible !== false);

  return (
    <A4Page
      settings={settings}
      showPageBreaks={showPageBreaks}
      estimatedPages={estimatedPages}
      className="font-['Arimo',sans-serif] text-gray-900"
    >
      {/* Header */}
      <header className="text-center pb-3 border-b border-gray-300">
        <h1 className="text-2xl font-bold tracking-tight text-black mb-1">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        {personalInfo.headline && (
          <p className="text-xs font-semibold text-gray-700 tracking-wide uppercase mb-1">
            {personalInfo.headline}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-gray-600 mt-1">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
          {personalInfo.links?.map((link) => (
            <span key={link.id}>
              •{' '}
              <a href={link.url} target="_blank" rel="noreferrer" className="text-black hover:underline">
                {link.label}
              </a>
            </span>
          ))}
        </div>
      </header>

      {/* Sections rendered in user-defined order */}
      {visibleSections.map((sec) => (
        <section key={sec.id} className="resume-section">
          <SectionHeading>{sec.title}</SectionHeading>
          <SectionContent section={sec} />
        </section>
      ))}
    </A4Page>
  );
}

function SectionContent({ section }: { section: Section }) {
  const data = section.data as any;
  if (!data) return null;

  switch (section.type) {
    case 'summary':
      return <p className="text-xs text-gray-700 leading-relaxed">{data.text}</p>;

    case 'skills':
      return (
        <div className="space-y-1 text-xs text-gray-800">
          {data.groups?.map((g: any) => (
            <div key={g.id} className="flex">
              <span className="font-bold w-36 flex-shrink-0 text-gray-900">{g.category}:</span>
              <span>{g.items?.join(', ')}</span>
            </div>
          ))}
        </div>
      );

    case 'education':
      return (
        <div className="space-y-2">
          {data.entries?.map((e: any) => (
            <div key={e.id} className="resume-entry">
              <EntryRow
                title={e.institution}
                subtitle={`${e.degree}${e.field ? ` in ${e.field}` : ''}${e.grade ? ` (${e.grade})` : ''}`}
                date={formatDateRange(e.startDate, e.endDate, e.current)}
                location={e.location}
              />
              <BulletList bullets={e.details || []} />
            </div>
          ))}
        </div>
      );

    case 'experience':
    case 'internships':
    case 'extracurricular':
      return (
        <div className="space-y-3">
          {data.entries?.map((e: any) => (
            <div key={e.id} className="resume-entry">
              <EntryRow
                title={e.role}
                subtitle={e.organization}
                date={formatDateRange(e.startDate, e.endDate, e.current)}
                location={e.location}
              />
              <BulletList bullets={e.bullets || []} />
            </div>
          ))}
        </div>
      );

    case 'projects':
      return (
        <div className="space-y-3">
          {data.entries?.map((e: any) => (
            <div key={e.id} className="resume-entry">
              <EntryRow
                title={e.name}
                subtitle={e.techStack?.length ? `Tech: ${e.techStack.join(', ')}` : undefined}
                date={formatDateRange(e.startDate, e.endDate)}
                link={e.link}
              />
              <BulletList bullets={e.bullets || []} />
            </div>
          ))}
        </div>
      );

    case 'certifications':
      return (
        <div className="space-y-1">
          {data.entries?.map((e: any) => (
            <div key={e.id} className="resume-entry">
              <EntryRow
                title={e.name}
                subtitle={e.issuer}
                date={e.date}
                link={e.link}
              />
            </div>
          ))}
        </div>
      );

    case 'achievements':
      return (
        <div className="space-y-2 text-xs">
          {data.entries?.map((e: any) => (
            <div key={e.id} className="resume-entry flex items-baseline justify-between gap-2">
              <div>
                <span className="font-bold text-gray-900">{e.title}</span>
                {e.description && <span className="text-gray-700 ml-1.5">— {e.description}</span>}
              </div>
              {e.date && <span className="text-[11px] text-gray-500 whitespace-nowrap">{e.date}</span>}
            </div>
          ))}
        </div>
      );

    case 'languages':
      return (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {data.entries?.map((e: any) => (
            <span key={e.id}>
              <strong>{e.language}</strong> <span className="text-gray-500">({e.proficiency})</span>
            </span>
          ))}
        </div>
      );

    case 'custom':
      return (
        <div className="space-y-2">
          {data.entries?.map((e: any) => (
            <div key={e.id} className="resume-entry">
              <EntryRow title={e.title} subtitle={e.subtitle} date={e.date} />
              <BulletList bullets={e.bullets || []} />
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}
