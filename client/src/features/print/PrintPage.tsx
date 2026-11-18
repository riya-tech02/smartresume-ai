import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router';
import { api } from '../../lib/api';
import { getTemplateComponent } from '../../templates/registry';
import { A4Page } from '../../templates/A4Page';
import type { ResumeData } from '@smartresume/shared';

export function PrintPage() {
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const token = searchParams.get('token');

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResume() {
      try {
        let data: ResumeData;
        if (token) {
          // Token-based print (Puppeteer headless browser)
          data = await api.get<ResumeData>(`/print/resume?token=${encodeURIComponent(token)}`);
        } else if (id) {
          // User-initiated browser print
          data = await api.get<ResumeData>(`/resumes/${id}`);
        } else {
          setError('No resume identifier or print token provided.');
          return;
        }

        setResume(data);

        // Wait for fonts and paint
        if (document.fonts) {
          await document.fonts.ready;
        }

        // Signal to Puppeteer that page is fully rendered
        setTimeout(() => {
          (window as any).__PRINT_READY__ = true;
          if (!token && id) {
            // Trigger native print dialog for user
            window.print();
          }
        }, 300);
      } catch (err: any) {
        setError(err.message || 'Failed to load resume for printing');
      }
    }

    loadResume();
  }, [token, id]);

  if (error) {
    return (
      <div className="p-8 text-center text-danger">
        <p className="font-bold">Print Error</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="p-8 text-center text-text-muted text-xs">
        Loading resume for print...
      </div>
    );
  }

  const TemplateComponent = getTemplateComponent(resume.templateId);

  return (
    <div className="print-canvas bg-white min-h-screen">
      <TemplateComponent resume={resume} />
    </div>
  );
}
