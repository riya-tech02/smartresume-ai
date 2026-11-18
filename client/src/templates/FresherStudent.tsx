import React from 'react';
import { A4Page } from './A4Page.js';
import { SectionHeading, EntryRow, BulletList, formatDateRange } from './primitives.js';
import type { ResumeData, Section } from '@smartresume/shared';

export function FresherStudentTemplate({
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
      className="font-['Source_Sans_3',sans-serif] text-gray-900"
    >
      {/* Header */}
      <header className="text-center pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          {personalInfo.fullName || 'Student Name'}
        </h1>
        {personalInfo.headline && (
          <p className="text-sm font-medium text-[var(--resume-accent,#4F46E5)] mt-1">
            {personalInfo.headline}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-gray-600 mt-2">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
          {personalInfo.links?.map((link) => (
            <span key={link.id}>
              •{' '}
              <a href={link.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                {link.label}
              </a>
            </span>
          ))}
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
      return <p className="text-xs text-gray-700 leading-relaxed italic">{data.text}</p>;

    case 'education':
      return (
        <div className="space-y-3">
          {data.entries?.map((e: any) => (
            <div key={e.id} className="resume-entry">
              <EntryRow
                title={e.institution}
                subtitle={`${e.degree}${e.field ? ` in ${e.field}` : ''}${e.grade ? ` (GPA: ${e.grade})` : ''}`}
                date={formatDateRange(e.startDate, e.endDate, e.current)}
                location={e.location}
              />
              <BulletList bullets={e.details || []} />
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
                subtitle={e.techStack?.length ? `Technologies: ${e.techStack.join(', ')}` : undefined}
                date={formatDateRange(e.startDate, e.endDate)}
                link={e.link}
              />
              <BulletList bullets={e.bullets || []} />
            </div>
          ))}
        </div>
      );

    case 'skills':
      return (
        <div className="grid grid-cols-1 gap-1.5 text-xs">
          {data.groups?.map((g: any) => (
            <div key={g.id} className="flex">
              <span className="font-semibold text-gray-900 w-40 flex-shrink-0">{g.category}:</span>
              <span className="text-gray-700">{g.items?.join(', ')}</span>
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

    case 'certifications':
      return (
        <div className="space-y-1.5 text-xs">
          {data.entries?.map((e: any) => (
            <div key={e.id} className="resume-entry flex justify-between">
              <span>
                <strong>{e.name}</strong> — {e.issuer}
              </span>
              <span className="text-gray-500">{e.date}</span>
            </div>
          ))}
        </div>
      );

    case 'achievements':
      return (
        <div className="space-y-2 text-xs">
          {data.entries?.map((e: any) => (
            <div key={e.id} className="resume-entry">
              <div className="flex justify-between font-semibold text-gray-900">
                <span>{e.title}</span>
                <span className="text-gray-500 font-normal">{e.date}</span>
              </div>
              {e.description && <p className="text-gray-600 mt-0.5">{e.description}</p>}
            </div>
          ))}
        </div>
      );

    case 'languages':
      return (
        <div className="flex flex-wrap gap-4 text-xs">
          {data.entries?.map((e: any) => (
            <span key={e.id}>
              <strong>{e.language}</strong>: {e.proficiency}
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
