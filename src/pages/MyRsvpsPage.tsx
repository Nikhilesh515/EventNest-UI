import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/auth-store';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { StampEntry } from '../components/StampEntry';
import { ConfirmModal } from '../components/ConfirmModal';
import { useState } from 'react';
import type { RsvpDetail, RsvpStatus } from '../types';

interface RsvpsResponse {
  result: RsvpDetail[];
}

const STATUS_PARAM: Record<RsvpStatus, string> = {
  Confirmed: 'Confirmed',
  Maybe: 'Maybe',
  Declined: 'Declined',
  Cancelled: 'Cancelled',
};

export function MyRsvpsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['rsvps', 'my'],
    queryFn: () => api.get<RsvpsResponse>(`/api/users/${user?.id}/rsvps`),
    enabled: isAuthenticated && !!user?.id,
  });

  const changeMutation = useMutation({
    mutationFn: ({ rsvpId, status }: { rsvpId: string; status: RsvpStatus }) =>
      api.put(`/api/rsvps/${rsvpId}`, { status: STATUS_PARAM[status] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsvps', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (eventId: string) => api.delete(`/api/events/${eventId}/rsvps`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsvps', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setCancelTarget(null);
    },
  });

  if (!isAuthenticated) {
    return (
      <div style={{ paddingTop: 'var(--space-12)' }}>
        <p style={{ textAlign: 'center' }}>Log in to see your RSVPs.</p>
        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          <Link className="btn btn--primary" to="/login">Log in</Link>
        </div>
      </div>
    );
  }

  const rsvps = data?.result || [];
  const now = new Date();
  const eventDate = (r: RsvpDetail) => new Date(r.eventStartsAt || r.respondedAt);
  const upcoming = rsvps.filter((r) => r.status !== 'Cancelled' && eventDate(r) >= now);
  const past = rsvps.filter((r) => r.status !== 'Cancelled' && eventDate(r) < now);
  const cancelled = rsvps.filter((r) => r.status === 'Cancelled');

  const goingCount = rsvps.filter((r) => r.status === 'Confirmed').length;
  const maybeCount = rsvps.filter((r) => r.status === 'Maybe').length;

  return (
    <div className="stack-6">
      <Breadcrumbs items={[{ label: 'Events', href: '/events' }, { label: 'My RSVPs' }]} />

      <header className="page-doc">
        <span className="washi page-doc__tape washi--sakura" aria-hidden="true" />
        <span className="page-doc__kanji kanji-watermark" aria-hidden="true" lang="ja">縁</span>
        <div className="page-doc__head">
          <p className="page-doc__overline">Attendee · 縁</p>
          <h1 className="page-doc__title">My RSVPs</h1>
          <p className="page-doc__sub">
            {rsvps.length} responses · {goingCount} going · {maybeCount} maybe
          </p>
        </div>
      </header>

      <div className="stamp-log">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="log-entry" aria-busy="true" style={{ minHeight: 60 }} />
          ))
        ) : rsvps.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>
            No RSVPs yet. <Link to="/events">Browse events</Link>
          </p>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="log-group">
                <h2 className="log-group__head">Upcoming <span className="tab__count">({upcoming.length})</span></h2>
                {upcoming.map((r) => (
                  <StampEntry
                    key={r.id}
                    rsvp={r}
                    onChangeStatus={(rsvpId, status) => changeMutation.mutate({ rsvpId, status })}
                    onCancel={(eventId) => setCancelTarget(eventId)}
                  />
                ))}
              </section>
            )}
            {past.length > 0 && (
              <section className="log-group" style={{ marginTop: 'var(--space-6)' }}>
                <h2 className="log-group__head">Past <span className="tab__count">({past.length})</span></h2>
                {past.map((r) => (
                  <StampEntry key={r.id} rsvp={r} isPast />
                ))}
              </section>
            )}
            {cancelled.length > 0 && (
              <details className="rsvp-details" style={{ marginTop: 'var(--space-6)' }}>
                <summary>Cancelled ({cancelled.length})</summary>
                {cancelled.map((r) => (
                  <StampEntry key={r.id} rsvp={r} isPast />
                ))}
              </details>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        open={!!cancelTarget}
        title="Remove your RSVP?"
        body="Keep it"
        confirmLabel="Yes, cancel"
        danger
        onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget)}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
