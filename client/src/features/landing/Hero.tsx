import React, { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button.js';
import { ArrowRight, CheckCircle2, Sparkles, Shield, Download } from 'lucide-react';
import { getTemplate } from '../../templates/registry.js';
import type { ResumeData } from '@smartresume/shared';
import { SAMPLE_PERSONAL_INFO, SAMPLE_SECTIONS } from '../../../../server/src/modules/resumes/sample/sampleResume.js';

const DEMO_RESUME: ResumeData = {
  id: 'landing_demo',
  userId: 'demo',
  title: 'Full Stack Engineer Resume',
  templateId: 'software-engineer',
  settings: { accentColor: '#4F46E5', fontScale: 'sm', spacing: 'compact' },
  personalInfo: SAMPLE_PERSONAL_INFO,
  sections: SAMPLE_SECTIONS,
  completion: 95,
  lastAtsScore: 88,
  revision: 1,
  isSample: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

export function Hero() {
  const [activeTemplate, setActiveTemplate] = useState<'software-engineer' | 'minimal-ats' | 'fresher-student' | 'modern-professional'>('software-engineer');
  const templateDef = getTemplate(activeTemplate);
  const TemplateComponent = templateDef.component;

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background radial gradient accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Next-Gen AI Resume & ATS Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Build Resumes That Beat the <span className="text-indigo-600">ATS</span> & Land Interviews
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              College students, freshers, and developers: create single-column, ATS-verified resumes in under 15 minutes. Score against real job descriptions with zero fabricated claims.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-sm font-bold shadow-md shadow-indigo-500/20" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Create Free Resume
                </Button>
              </Link>
              <a href="#templates" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm">
                  Explore Templates
                </Button>
              </a>
            </div>

            {/* Micro value props */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600 font-medium">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Deterministic ATS Scoring</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Shield className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Zero AI Hallucinations</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Download className="w-4 h-4 text-gray-700 flex-shrink-0" />
                <span>Selectable A4 PDF Export</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Template Card */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            {/* Template switcher pill */}
            <div className="flex bg-white/90 backdrop-blur-md p-1 rounded-xl border border-gray-200 shadow-md mb-4 text-[11px] font-semibold">
              {(['software-engineer', 'minimal-ats', 'fresher-student', 'modern-professional'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTemplate(t)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeTemplate === t
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t.split('-')[0]?.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Interactive Live Mini Preview Container */}
            <div className="w-[360px] sm:w-[420px] h-[540px] bg-white rounded-2xl shadow-2xl border border-gray-300 overflow-hidden relative group">
              <div className="absolute top-2 right-2 z-20 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                ATS Score: 88/100
              </div>

              {/* Scaled resume page */}
              <div
                className="origin-top-left pointer-events-none transform"
                style={{
                  transform: 'scale(0.48)',
                  width: '794px',
                }}
              >
                <TemplateComponent
                  resume={{
                    ...DEMO_RESUME,
                    templateId: activeTemplate,
                  }}
                />
              </div>

              {/* Interactive badge on hover */}
              <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-xl shadow-lg border border-gray-100">
                  Live React Preview
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
