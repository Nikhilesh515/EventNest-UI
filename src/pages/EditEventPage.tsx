import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/auth-store';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EventForm } from '../components/EventForm';
import { ConfirmModal } from '../components/ConfirmModal';
import { useState } from 'react';

interface EventTag {
  id: string;
  name: string;
  color: string;
}

interface EventData {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  visibility: string;
  tags: EventTag[];
  status: string;
  organizerId: string;
}

interface EventResponse {
  result: EventData;
}

interface TagsResponse {
  result: EventTag[];
}

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get<EventResponse>(`/api/events/${id}`),
    enabled: !!id,
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get<TagsResponse>('/api/tags'),
  });

  const updateMutation = useMutation({
    mutationFn: (values: { title: string; description: string; location: string; startsAt: string; endsAt: string; capacity: number; visibility: string; tagIds: string[] }) =>
      api.put(`/api/events/${id}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      navigate(`/events/${id}`);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (action: string) => api.put(`/api/events/${id}/${action}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      setConfirmAction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/events/${id}`),
    onSuccess: () => navigate('/my-events'),
  });

  const event = eventData?.result;

  if (isLoading) {
    return (
      <div className="stack-6">
        <div className="page-doc" aria-busy="true">
          <div className="page-doc__tape" aria-hidden="true" />
          <div className="page-doc__content">
            <h1 className="page-doc__title">Loading…</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="stack-6">
        <p>Event not found.</p>
      </div>
    );
  }

  const isOwner = user?.id === event.organizerId;

  return (
    <div className="stack-6">
      <Breadcrumbs items={[{ label: 'My Events', href: '/my-events' }, { label: 'Edit event' }]} />

      <div className="clipboard">
        <span className="clipboard__clip" aria-hidden="true" />

        <header className="page-doc">
          <span className="washi page-doc__tape washi--yamabuki" aria-hidden="true" />
          <span className="page-doc__kanji kanji-watermark" aria-hidden="true" lang="ja">手帳</span>
          <div className="page-doc__head">
            <p className="page-doc__overline">MY EVENTS / EDIT EVENT · 手帳</p>
            <h1 className="page-doc__title">Edit event</h1>
          </div>
        </header>

        <EventForm
          initialValues={{
            title: event.title,
            description: event.description || '',
            location: event.location || '',
            startsAt: event.startsAt,
            endsAt: event.endsAt,
            capacity: event.capacity,
            visibility: event.visibility as 'Public' | 'Private',
            tagIds: event.tags.map((t) => t.id),
          }}
          availableTags={tagsData?.result || []}
          loading={updateMutation.isPending}
          submitLabel="Save changes"
          onSubmit={(values) => updateMutation.mutate(values)}
          onCancel={() => navigate(`/events/${id}`)}
        />

        {isOwner && (
          <>
            <section className="clipboard-status">
              <p className="page-doc__overline">Status</p>
              <div className="cluster-3" style={{ marginTop: 'var(--space-3)' }}>
                <span className={`badge badge--${event.status.toLowerCase()}`}>{event.status}</span>
                {event.status === 'Draft' && (
                  <button type="button" className="btn btn--leaf btn--sm" onClick={() => statusMutation.mutate('publish')}>
                    Publish
                  </button>
                )}
                {event.status === 'Published' && (
                  <button type="button" className="btn btn--sun btn--sm" onClick={() => setConfirmAction('cancel')}>
                    Cancel event
                  </button>
                )}
              </div>
            </section>

            <section className="clipboard-danger">
              <button type="button" className="btn btn--danger btn--sm" onClick={() => setConfirmAction('delete')}>
                Delete event
              </button>
            </section>
          </>
        )}
      </div>

      <ConfirmModal
        open={confirmAction === 'cancel'}
        title="Cancel this event?"
        body="Guests will see it's off."
        confirmLabel="Cancel event"
        danger
        onConfirm={() => statusMutation.mutate('cancel')}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmModal
        open={confirmAction === 'delete'}
        title="Delete this event?"
        body="This removes the event and its RSVPs. This can't be undone."
        confirmLabel="Delete event"
        danger
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
