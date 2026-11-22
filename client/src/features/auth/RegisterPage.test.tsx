import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { RegisterPage } from './RegisterPage';

describe('RegisterPage', () => {
  it('shows password validation instead of crashing when the password has no letters', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '12345678' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Free Account' }));

    expect(
      await screen.findByText('Must contain at least one letter and one number'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Registration failed. Please check your connection.')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create Free Account' })).toBeEnabled();
    });
  });
});
