import React from 'react';
import { A4Page } from './A4Page.js';
import { SectionHeading, EntryRow, BulletList, formatDateRange } from './primitives.js';
import type { ResumeData, Section } from '@smartresume/shared';

export function ModernProfessionalTemplate({
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

  // Split into sidebar sections vs main column sections per PRD §9.3
  const sidebarTypes = ['skills', 'languages', 'certifications'];
  const sidebarSections = visibleSections.filter((s) => sidebarTypes.includes(s.type));
  const mainSections = visibleSections.filter((s) => !sidebarTypes.includes(s.type));

  return (
    <A4Page
      settings={settings}
      showPageBreaks={showPageBreaks}
      estimatedPages={estimatedPages}
      className="p-0 font-['Inter',sans-serif] text-gray-900"
    >
      {/* Top Banner */}
      <div className="h-3 bg-[var(--resume-accent,#4F46E5)] w-full" />

      {/* Header */}
      <header className="px-10 pt-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {personalInfo.fullName || 'Candidate Name'}
        </h1>
        {personalInfo.headline && (
          <p className="text-xs font-semibold text-[var(--resume-accent,#4F46E5)] tracking-wider uppercase mt-0.5">
            {personalInfo.headline}
          </p>
        )}
      </header>

      {/* Two-Column Body */}
      <div className="flex px-10 py-5 gap-8">
        {/* Left Sidebar (approx 32% width) */}
        <aside className="w-[32%] flex-shrink-0 space-y-5 border-r border-gray-100 pr-6">
          {/* Contact Details */}
          <div>
            <SectionHeading>Contact</SectionHeading>
            <div className="space-y-1.5 text-[11px] text-gray-700">
              {personalInfo.email && (
                <div className="truncate">
                  <span className="font-semibold block text-[10px] text-gray-500 uppercase">Email</span>
                  <a href={`mailto:${personalInfo.email}`} className="hover:underline">{personalInfo.email}</a>
                </div>
              )}
              {personalInfo.phone && (
                <div>
                  <span className="font-semibold block text-[10px] text-gray-500 uppercase">Phone</span>
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div>
                  <span className="font-semibold block text-[10px] text-gray-500 uppercase">Location</span>
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.links && personalInfo.links.length > 0 && (
                <div>
                  <span className="font-semibold block text-[10px] text-gray-500 uppercase">Links</span>
                  <div className="space-y-0.5 mt-0.5">
                    {personalInfo.links.map((link) => (
                      <div key={link.id}>
                        <a href={link.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                          {link.label}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar sections: skills, languages, certifications */}
          {sidebarSections.map((sec) => (
            <div key={sec.id} className="space-y-1.5">
              <SectionHeading>{sec.title}</SectionHeading>
              <SidebarSectionContent section={sec} />
            </div>
          ))}
        </aside>

        {/* Main Column (approx 68% width) */}
        <main className="w-[68%] space-y-5">
          {mainSections.map((sec) => (
            <section key={sec.id} className="resume-section">
              <SectionHeading>{sec.title}</SectionHeading>
              <MainSectionContent section={sec} />
            </section>
          ))}
        </main>
      </div>
    </A4Page>
  );
}

function SidebarSectionContent({ section }: { section: Section }) {
  const data = section.data as any;
  if (!data) return null;

  switch (section.type) {
    case 'skills':
      return (
        <div className="space-y-2 text-[11px]">
          {data.groups?.map((g: any) => (
            <div key={g.id}>
              <span className="font-semibold text-gray-900 block text-[11px] mb-0.5">{g.category}</span>
              <p className="text-gray-600 leading-snug">{g.items?.join(', ')}</p>
            </div>
          ))}
        </div>
      );

    case 'languages':
      return (
        <div className="space-y-1 text-[11px]">
          {data.entries?.map((e: any) => (
            <div key={e.id} className="flex justify-between">
              <span className="font-medium text-gray-900">{e.language}</span>
              <span className="text-gray-500 text-[10px]">{e.proficiency}</span>
            </div>
          ))}
        </div>
      );

    case 'certifications':
      return (
        <div className="space-y-2 text-[11px]">
          {data.entries?.map((e: any) => (
            <div key={e.id}>
              <span className="font-semibold text-gray-900 block">{e.name}</span>
              <span className="text-gray-500 text-[10px] block">{e.issuer} {e.date ? `(${e.date})` : ''}</span>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

function MainSectionContent({ section }: { section: Section }) {
  const data = section.data as any;
  if (!data) return null;

  switch (section.type) {
    case 'summary':
      return <p className="text-xs text-gray-700 leading-relaxed">{data.text}</p>;

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

    case 'education':
      return (
        <div className="space-y-2.5">
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

    case 'achievements':
      return (
        <div className="space-y-2 text-xs">
          {data.entries?.map((e: any) => (
            <div key={e.id} className="resume-entry">
              <div className="flex justify-between font-bold text-gray-900">
                <span>{e.title}</span>
                <span className="text-gray-500 font-normal text-[10px]">{e.date}</span>
              </div>
              {e.description && <p className="text-gray-600 mt-0.5">{e.description}</p>}
            </div>
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
