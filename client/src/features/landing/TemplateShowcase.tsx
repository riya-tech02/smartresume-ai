import React from 'react';
import { Link } from 'react-router';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { TEMPLATES } from '@smartresume/shared';
import { getTemplate } from '../../templates/registry.js';
import type { ResumeData } from '@smartresume/shared';
import { SAMPLE_PERSONAL_INFO, SAMPLE_SECTIONS } from '../../../../server/src/modules/resumes/sample/sampleResume.js';

const SHOWCASE_RESUME: ResumeData = {
  id: 'showcase_resume',
  userId: 'showcase',
  title: 'Showcase Resume',
  templateId: 'fresher-student',
  settings: { accentColor: '#4F46E5', fontScale: 'sm', spacing: 'compact' },
  personalInfo: SAMPLE_PERSONAL_INFO,
  sections: SAMPLE_SECTIONS,
  completion: 90,
  lastAtsScore: 82,
  revision: 1,
  isSample: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

export function TemplateShowcase() {
  return (
    <section id="templates" className="py-20 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Templates</span>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Crafted for Tech Portals and Recruiters
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Zero tables, no background images, real selectable text. Switch between templates anytime with complete data preservation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATES.map((tmpl) => {
            const def = getTemplate(tmpl.id);
            const TemplateComp = def.component;

            return (
              <Card key={tmpl.id} hover className="flex flex-col justify-between overflow-hidden">
                <div className="p-3 bg-gray-100/70 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{tmpl.name}</span>
                  {tmpl.atsSafe ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> ATS Safe
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                      Two-Column
                    </span>
                  )}
                </div>

                {/* Scaled Visual Thumbnail rendered from real component */}
                <div className="relative h-64 bg-white overflow-hidden border-b border-gray-100 flex items-center justify-center p-2">
                  <div
                    className="origin-top pointer-events-none transform"
                    style={{
                      transform: 'scale(0.24)',
                      width: '794px',
                      height: '1123px',
                    }}
                  >
                    <TemplateComp
                      resume={{
                        ...SHOWCASE_RESUME,
                        templateId: tmpl.id,
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] text-gray-600 leading-relaxed mb-2">{tmpl.description}</p>
                    <div className="text-[10px] text-gray-400 space-y-0.5">
                      <p><strong>Font:</strong> {tmpl.typography}</p>
                      <p><strong>Layout:</strong> {tmpl.layout}</p>
                    </div>
                  </div>

                  <Link to={`/register?template=${tmpl.id}`} className="block w-full pt-2">
                    <Button size="sm" variant="outline" className="w-full text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Use This Template
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
