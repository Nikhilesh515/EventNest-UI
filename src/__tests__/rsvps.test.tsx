import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router';
import { EventDetailPage } from '../pages/EventDetailPage';
import { AppToaster } from '../components/AppToaster';
import { useAuthStore } from '../lib/auth-store';

function renderEventDetail() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/events/1']}>
        <Routes>
          <Route path="/events/:id" element={<EventDetailPage />} />
        </Routes>
        <AppToaster />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('RSVP Flow', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it('submit RSVP Going shows success toast', async () => {
    const user = userEvent.setup();
    renderEventDetail();

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: /^going$/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('radio', { name: /^going$/i }));
    await user.click(screen.getByRole('button', { name: /rsvp · going/i }));

    await waitFor(() => {
      expect(screen.getByText(/rsvp submitted/i)).toBeInTheDocument();
    });
  });

  it('RSVP beyond capacity shows error toast', async () => {
    server.use(
      http.post('/api/events/:eventId/rsvps', () => {
        return HttpResponse.json(
          { code: 409, success: false, message: 'Capacity exceeded', result: null, errors: null },
          { status: 409 },
        );
      }),
    );

    const user = userEvent.setup();
    renderEventDetail();

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: /^going$/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('radio', { name: /^going$/i }));
    await user.click(screen.getByRole('button', { name: /rsvp · going/i }));

    await waitFor(() => {
      expect(screen.getByText(/capacity exceeded/i)).toBeInTheDocument();
    });
  });
});
