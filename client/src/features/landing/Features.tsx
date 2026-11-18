import React from 'react';
import { Card } from '../../components/ui/Card.js';
import {
  CheckCircle,
  Sparkles,
  Briefcase,
  Layers,
  Download,
  Gauge,
} from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Gauge,
      title: 'Deterministic ATS Analyzer',
      description:
        'Transparent 19-point heuristic check (F1–F10 formatting, C1–C9 content quality) with actionable, deep-linked fix recommendations.',
      badge: 'Explainable Score',
    },
    {
      icon: Sparkles,
      title: 'Honest AI Assistant',
      description:
        'Enhance bullet points with action verbs and quantifiable metrics. Strict fact-guard prevents fabricated credentials or false claims.',
      badge: 'Zero Hallucinations',
    },
    {
      icon: Briefcase,
      title: 'Job Description Matcher',
      description:
        'Paste any job posting. The analyzer extracts required technical skills and keywords, calculating exact match rates with instant gap suggestions.',
      badge: 'Tailored Applications',
    },
    {
      icon: Layers,
      title: 'Structured Resume Builder',
      description:
        'Intuitive 3-pane live editor with drag-and-drop reordering, instant keystroke preview, and automatic 1.5s debounced autosaving.',
      badge: 'Instant Autosave',
    },
    {
      icon: Download,
      title: 'Pixel-Perfect A4 PDF Export',
      description:
        'Rendered with headless Chromium from the exact same React templates shown in the editor. Multi-page capable with clean selectable text.',
      badge: 'Selectable Text',
    },
    {
      icon: CheckCircle,
      title: '4 Professional Templates',
      description:
        'Designed specifically for college students, software engineers, and experienced professionals. Switch templates anytime with zero data loss.',
      badge: '100% Data Preserved',
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50/50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Features</span>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Everything You Need to Land Technical Interviews
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Engineered with industry-standard Applicant Tracking System parsers and modern SaaS design patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} hover className="p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50/60 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {f.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1.5">{f.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
