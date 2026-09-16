import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import type { ReactElement } from 'react';
import { CreateEventPage } from '../pages/CreateEventPage';
import { AppToaster } from '../components/AppToaster';
import { useAuthStore } from '../lib/auth-store';

function renderWithProviders(ui: ReactElement, initialEntries?: string[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        {ui}
        <AppToaster />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Event CRUD', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it('create event form submits and shows success toast', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateEventPage />);

    await user.type(screen.getByLabelText(/title/i), 'Test Event');
    fireEvent.change(screen.getByLabelText(/start/i), { target: { value: '2026-10-01T18:00' } });
    fireEvent.change(screen.getByLabelText(/end/i), { target: { value: '2026-10-01T20:00' } });

    await user.click(screen.getByRole('button', { name: /create & publish/i }));

    await waitFor(() => {
      expect(screen.getByText(/event created successfully/i)).toBeInTheDocument();
    });
  });

  it('create event with missing title shows validation error', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateEventPage />);

    await user.click(screen.getByRole('button', { name: /create & publish/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toHaveAttribute('aria-invalid', 'true');
    });
    expect(screen.getByRole('alert')).toHaveTextContent(/title is required/i);
  });
});
