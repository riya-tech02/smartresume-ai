import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../lib/api';
import type { ResumeSummary } from '@smartresume/shared';
import { DashboardPage } from './DashboardPage';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const resume: ResumeSummary = {
  id: 'resume-123',
  title: 'Saved Resume',
  templateId: 'minimal-ats',
  completion: 80,
  lastAtsScore: null,
  isSample: true,
  updatedAt: '2026-11-18T08:00:00.000Z',
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue([resume]);
  });

  it('renders resume summaries returned as the API data array', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Saved Resume')).toBeInTheDocument();
    expect(screen.getByText('1 / 20')).toBeInTheDocument();
  });
});
