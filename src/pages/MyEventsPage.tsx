import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/auth-store';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PunchRow } from '../components/PunchRow';
import { ConfirmModal } from '../components/ConfirmModal';

interface EventTag {
  id: string;
  name: string;
  color: string;
}

interface EventData {
  id: string;
  title: string;
  location: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  goingCount: number;
  maybeCount: number;
  status: string;
  visibility: string;
  tags: EventTag[];
}

interface EventsResponse {
  result: EventData[];
}

type TabKey = 'all' | 'draft' | 'published' | 'completed' | 'cancelled';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function MyEventsPage() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['events', 'my'],
    queryFn: () => api.get<EventsResponse>('/api/events/my'),
    enabled: isAuthenticated,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.put(`/api/events/${id}/${action}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', 'my'] });
      setConfirmAction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', 'my'] });
      setConfirmAction(null);
    },
  });

  if (!isAuthenticated) {
    return (
      <div style={{ paddingTop: 'var(--space-12)' }}>
        <p style={{ textAlign: 'center' }}>Log in to see your events.</p>
        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          <Link className="btn btn--primary" to="/login">Log in</Link>
        </div>
      </div>
    );
  }

  const events = data?.result || [];
  const filtered = activeTab === 'all' ? events : events.filter((e) => e.status.toLowerCase() === activeTab);

  const counts = {
    all: events.length,
    draft: events.filter((e) => e.status === 'Draft').length,
    published: events.filter((e) => e.status === 'Published').length,
    completed: events.filter((e) => e.status === 'Completed').length,
    cancelled: events.filter((e) => e.status === 'Cancelled').length,
  };

  return (
    <div className="stack-6">
      <Breadcrumbs items={[{ label: 'Events', href: '/events' }, { label: 'My events' }]} />

      <header className="page-doc">
        <span className="washi page-doc__tape washi--matcha" aria-hidden="true" />
        <span className="washi page-doc__corner-tape washi--sakura" aria-hidden="true" />
        <span className="page-doc__kanji kanji-watermark" aria-hidden="true" lang="ja">手帳</span>
        <div className="page-doc__head">
          <p className="page-doc__overline">Organizer · 手帳</p>
          <h1 className="page-doc__title">My events</h1>
          <p className="page-doc__sub">{events.length} events · {counts.published} published · {counts.draft} draft</p>
        </div>
        <div className="page-doc__actions">
          <Link className="btn btn--primary" to="/events/new">+ Create event</Link>
        </div>
      </header>

      <div className="tabs" role="tablist" aria-label="Event status">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            className="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="tab__count">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      <div className="notebook">
        <div className="notebook__spiral" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => <span key={i} />)}
        </div>
        <div className="notebook__body">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="punch-row" aria-busy="true" style={{ minHeight: 80 }} />
            ))
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>
              No events found. <Link to="/events/new">Create one</Link>
            </p>
          ) : (
            filtered.map((ev) => (
              <PunchRow
                key={ev.id}
                event={ev}
                onPublish={(id) => statusMutation.mutate({ id, action: 'publish' })}
                onCancel={(id) => setConfirmAction({ type: 'cancel', id })}
                onComplete={(id) => statusMutation.mutate({ id, action: 'complete' })}
                onDelete={(id) => setConfirmAction({ type: 'delete', id })}
                loading={statusMutation.isPending || deleteMutation.isPending}
              />
            ))
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmAction?.type === 'cancel'}
        title="Cancel this event?"
        body="Guests will see it's off."
        confirmLabel="Cancel event"
        danger
        onConfirm={() => confirmAction && statusMutation.mutate({ id: confirmAction.id, action: 'cancel' })}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmModal
        open={confirmAction?.type === 'delete'}
        title="Delete this event?"
        body="This removes the event and its RSVPs. This can't be undone."
        confirmLabel="Delete event"
        danger
        onConfirm={() => confirmAction && deleteMutation.mutate(confirmAction.id)}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
