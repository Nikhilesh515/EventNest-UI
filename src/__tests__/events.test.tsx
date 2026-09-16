import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Routes, Route } from 'react-router';
import { CreateEventPage } from '../pages/CreateEventPage';
import { EventDetailPage } from '../pages/EventDetailPage';
import { useAuthStore } from '../lib/auth-store';
import { server } from '../mocks/server';
import { testEvent, testOrganizer } from '../mocks/handlers';
import { renderWithProviders } from './test-utils';

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

  it('publishes a Draft from the event detail page', async () => {
    const user = userEvent.setup();
    let published = false;

    useAuthStore.setState({
      user: testOrganizer,
      accessToken: 'mock-access-token',
      isAuthenticated: true,
      isBootstrapping: false,
    });

    server.use(
      http.get('/api/events/:eventId', () =>
        HttpResponse.json({
          code: 200,
          success: true,
          message: null,
          result: { ...testEvent, status: 'Draft' },
          errors: null,
        }),
      ),
      http.put('/api/events/:eventId/publish', () => {
        published = true;
        return HttpResponse.json({
          code: 200,
          success: true,
          message: null,
          result: { ...testEvent, status: 'Published' },
          errors: null,
        });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/events/:id" element={<EventDetailPage />} />
      </Routes>,
      { initialEntries: ['/events/1'] },
    );

    await user.click(await screen.findByRole('button', { name: /^publish$/i }));

    await waitFor(() => expect(published).toBe(true));
    expect(await screen.findByText(/event published/i)).toBeInTheDocument();
  });

  it('disables the publish button while the request is in flight', async () => {
    const user = userEvent.setup();
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    useAuthStore.setState({
      user: testOrganizer,
      accessToken: 'mock-access-token',
      isAuthenticated: true,
      isBootstrapping: false,
    });

    server.use(
      http.get('/api/events/:eventId', () =>
        HttpResponse.json({
          code: 200,
          success: true,
          message: null,
          result: { ...testEvent, status: 'Draft' },
          errors: null,
        }),
      ),
      http.put('/api/events/:eventId/publish', async () => {
        await gate;
        return HttpResponse.json({
          code: 200,
          success: true,
          message: null,
          result: { ...testEvent, status: 'Published' },
          errors: null,
        });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/events/:id" element={<EventDetailPage />} />
      </Routes>,
      { initialEntries: ['/events/1'] },
    );

    const publishButton = await screen.findByRole('button', { name: /^publish$/i });
    await user.click(publishButton);

    expect(publishButton).toBeDisabled();

    release();
    await waitFor(() => expect(publishButton).not.toBeDisabled());
    expect(await screen.findByText(/event published/i)).toBeInTheDocument();
  });
});
