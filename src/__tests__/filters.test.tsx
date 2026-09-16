import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import type { ReactElement } from 'react';
import { EventsPage } from '../pages/EventsPage';
import { useAuthStore } from '../lib/auth-store';

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Filter/Search/Pagination', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it('events page renders and shows events from API', async () => {
    renderWithProviders(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText(/tech meetup/i)).toBeInTheDocument();
    });
  });

  it('search input filters events by title', async () => {
    server.use(
      http.get('/api/events', ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search');
        const matches = !search || 'tech meetup'.includes(search.toLowerCase());
        return HttpResponse.json({
          code: 200,
          success: true,
          message: null,
          result: {
            items: matches
              ? [
                  {
                    id: '1',
                    title: 'Tech Meetup',
                    description: 'A test event',
                    location: 'Online',
                    startsAt: new Date(Date.now() + 86400000).toISOString(),
                    endsAt: new Date(Date.now() + 90000000).toISOString(),
                    capacity: 50,
                    goingCount: 12,
                    maybeCount: 3,
                    organizerId: '2',
                    organizerName: 'Test Organizer',
                    status: 'Published',
                    visibility: 'Public',
                    tags: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ]
              : [],
            total: matches ? 1 : 0,
            page: 1,
            size: 10,
            pages: 1,
          },
          errors: null,
        });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText(/tech meetup/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'zzz');

    await waitFor(() => {
      expect(screen.getByText(/the stall is quiet/i)).toBeInTheDocument();
    });

    await user.clear(searchInput);
    await user.type(searchInput, 'tech');

    await waitFor(() => {
      expect(screen.getByText(/tech meetup/i)).toBeInTheDocument();
    });
  });

  it('pagination shows page info and navigates to page 2', async () => {
    server.use(
      http.get('/api/events', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page') || '1';

        if (page === '2') {
          return HttpResponse.json({
            code: 200,
            success: true,
            message: null,
            result: {
              items: [
                {
                  id: '2',
                  title: 'Page 2 Event',
                  description: null,
                  location: null,
                  startsAt: new Date(Date.now() + 86400000).toISOString(),
                  endsAt: new Date(Date.now() + 90000000).toISOString(),
                  capacity: 50,
                  goingCount: 0,
                  maybeCount: 0,
                  organizerId: '2',
                  organizerName: 'Test Organizer',
                  status: 'Published',
                  visibility: 'Public',
                  tags: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
              total: 11,
              page: 2,
              size: 10,
              pages: 2,
            },
            errors: null,
          });
        }

        return HttpResponse.json({
          code: 200,
          success: true,
          message: null,
          result: { items: [], total: 11, page: 1, size: 10, pages: 2 },
          errors: null,
        });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText(/page 2 event/i)).toBeInTheDocument();
    });
  });
});
