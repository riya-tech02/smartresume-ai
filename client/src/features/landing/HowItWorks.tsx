import React from 'react';
import { Edit3, CheckCircle, Download } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      icon: Edit3,
      title: 'Fill Your Experience',
      description: 'Start with example content or enter your education, technical skills, and project milestones in our structured editor.',
    },
    {
      step: '02',
      icon: CheckCircle,
      title: 'Analyze & Polish',
      description: 'Run our deterministic 19-point ATS checker, optimize bullets with the AI assistant, and compare keywords against job descriptions.',
    },
    {
      step: '03',
      icon: Download,
      title: 'Download & Apply',
      description: 'Export a verified, print-ready A4 PDF with real selectable text and clean pagination that parses flawlessly in applicant portals.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Workflow</span>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            From Blank Page to Job Application in 15 Minutes
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            A fast, distraction-free process designed to overcome blank-page paralysis and produce credible results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm mb-4 shadow-sm shadow-indigo-200">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Step {s.step}</span>
                <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
