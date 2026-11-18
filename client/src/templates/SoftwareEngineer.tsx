import React from 'react';
import { A4Page } from './A4Page.js';
import { SectionHeading, EntryRow, BulletList, formatDateRange } from './primitives.js';
import type { ResumeData, Section } from '@smartresume/shared';

export function SoftwareEngineerTemplate({
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
      className="font-['IBM_Plex_Sans',sans-serif] text-gray-900"
    >
      {/* Header */}
      <header className="pb-2 border-b-2 border-gray-900 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {personalInfo.fullName || 'Candidate Name'}
          </h1>
          {personalInfo.headline && (
            <p className="text-xs font-semibold text-gray-600 tracking-wide font-['IBM_Plex_Mono',monospace] mt-0.5">
              &gt; {personalInfo.headline}
            </p>
          )}
        </div>
        <div className="text-right text-[11px] text-gray-600 space-y-0.5">
          <div>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span className="ml-2 font-['IBM_Plex_Mono',monospace]">{personalInfo.phone}</span>}
          </div>
          <div className="flex justify-end gap-2 font-['IBM_Plex_Mono',monospace] text-[10px]">
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.links?.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                [{link.label}]
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Sections */}
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
        <div className="space-y-1 text-xs">
          {data.groups?.map((g: any) => (
            <div key={g.id} className="flex items-baseline">
              <span className="font-bold w-36 flex-shrink-0 text-gray-800 text-[11px] uppercase tracking-wider">
                {g.category}
              </span>
              <div className="flex flex-wrap gap-1">
                {g.items?.map((item: string, i: number) => (
                  <span
                    key={i}
                    className="font-['IBM_Plex_Mono',monospace] text-[10px] bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
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
                subtitle={`${e.degree}${e.field ? ` in ${e.field}` : ''}${e.grade ? ` • ${e.grade}` : ''}`}
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
        <div className="space-y-2.5">
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
        <div className="space-y-2.5">
          {data.entries?.map((e: any) => (
            <div key={e.id} className="resume-entry">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-xs text-gray-900">
                  {e.link ? (
                    <a href={e.link} target="_blank" rel="noreferrer" className="text-gray-900 hover:text-indigo-600 hover:underline">
                      {e.name} ↗
                    </a>
                  ) : (
                    e.name
                  )}
                </span>
                <span className="text-[10px] font-['IBM_Plex_Mono',monospace] text-gray-500">
                  {formatDateRange(e.startDate, e.endDate)}
                </span>
              </div>
              {e.techStack && e.techStack.length > 0 && (
                <div className="text-[10px] font-['IBM_Plex_Mono',monospace] text-indigo-700 my-0.5">
                  Tech: {e.techStack.join(' | ')}
                </div>
              )}
              <BulletList bullets={e.bullets || []} />
            </div>
          ))}
        </div>
      );

    case 'certifications':
      return (
        <div className="space-y-1 text-xs">
          {data.entries?.map((e: any) => (
            <div key={e.id} className="resume-entry flex justify-between items-baseline">
              <span className="font-semibold text-gray-900">
                {e.name} <span className="font-normal text-gray-600">— {e.issuer}</span>
              </span>
              <span className="text-[10px] font-['IBM_Plex_Mono',monospace] text-gray-500">{e.date}</span>
            </div>
          ))}
        </div>
      );

    case 'achievements':
      return (
        <div className="space-y-1.5 text-xs">
          {data.entries?.map((e: any) => (
            <div key={e.id} className="resume-entry">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-900">{e.title}</span>
                {e.date && <span className="text-[10px] font-['IBM_Plex_Mono',monospace] text-gray-500">{e.date}</span>}
              </div>
              {e.description && <p className="text-[11px] text-gray-600">{e.description}</p>}
            </div>
          ))}
        </div>
      );

    case 'languages':
      return (
        <div className="flex flex-wrap gap-2 text-xs">
          {data.entries?.map((e: any) => (
            <span key={e.id} className="bg-gray-100 px-2 py-0.5 rounded text-[11px]">
              {e.language} <span className="text-gray-500">({e.proficiency})</span>
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
