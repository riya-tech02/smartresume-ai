import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { ResumeCard } from './ResumeCard';
import type { ResumeSummary } from '@smartresume/shared';

const resume: ResumeSummary = {
  id: 'resume-123',
  title: 'Frontend Engineer',
  templateId: 'minimal-ats',
  completion: 80,
  lastAtsScore: 88,
  isSample: false,
  updatedAt: '2026-11-18T08:00:00.000Z',
};

describe('ResumeCard', () => {
  it('navigates to the builder from the open action', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<ResumeCard resume={resume} onRefresh={() => undefined} onRename={() => undefined} />} />
          <Route path="/builder/:id" element={<div>Builder route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('Builder route')).toBeInTheDocument();
  });

  it('provides a working ATS deep link', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<ResumeCard resume={resume} onRefresh={() => undefined} onRename={() => undefined} />} />
          <Route path="/ats" element={<div>ATS route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText('Resume options'));
    fireEvent.click(screen.getByRole('button', { name: 'Run ATS Analysis' }));
    expect(screen.getByText('ATS route')).toBeInTheDocument();
  });
});
