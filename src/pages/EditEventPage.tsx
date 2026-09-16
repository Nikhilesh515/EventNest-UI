import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api, ApiRequestError } from '../lib/api';
import { useAuthStore } from '../lib/auth-store';
import { isModerator } from '../lib/permissions';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EventForm, type EventFormMode } from '../components/EventForm';
import { ConfirmModal } from '../components/ConfirmModal';
import { Icon } from '../components/Icon';
import { useState } from 'react';
import type { Event, EventFormValues, TagsResponse } from '../types';

interface EventResponse {
  result: Event;
}

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const canCreateTag = isModerator(user);

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
    mutationFn: async ({ values, mode }: { values: EventFormValues; mode: EventFormMode }) => {
      await api.put(`/api/events/${id}`, values);
      if (mode === 'publish' && eventData?.result.status === 'Draft') {
        await api.put(`/api/events/${id}/publish`, {});
      }
    },
    onSuccess: () => {
      toast.success('Event updated successfully');
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(`/events/${id}`);
    },
    onError: (error: ApiRequestError) => {
      toast.error(error.message || 'Failed to update event');
    },
  });

  const statusMutation = useMutation({
    mutationFn: (action: string) => api.put(`/api/events/${id}/${action}`, {}),
    onSuccess: () => {
      toast.success('Event status updated');
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setConfirmAction(null);
    },
    onError: (error: ApiRequestError) => {
      toast.error(error.message || 'Failed to update event status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/events/${id}`),
    onSuccess: () => {
      toast.success('Event deleted');
      navigate('/my-events');
    },
    onError: (error: ApiRequestError) => {
      toast.error(error.message || 'Failed to delete event');
    },
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
          key={event.id}
          initialValues={{
            title: event.title,
            description: event.description || '',
            location: event.location || '',
            startsAt: event.startsAt,
            endsAt: event.endsAt,
            capacity: event.capacity,
            visibility: event.visibility,
            tagIds: event.tags.map((t) => t.id),
          }}
          availableTags={tagsData?.result || []}
          loading={updateMutation.isPending}
          canCreateTag={canCreateTag}
          onSubmit={(values, mode) => updateMutation.mutate({ values, mode })}
          onCancel={() => navigate(`/events/${id}`)}
        />

        {isOwner && (
          <>
            <section className="clipboard-status">
              <div className="edit-status-strip">
                <span className="field__label">Status: {event.status}</span>
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
                {event.status === 'Published' && new Date(event.endsAt) < new Date() && (
                  <button type="button" className="btn btn--leaf btn--sm" onClick={() => statusMutation.mutate('complete')}>
                    Mark complete
                  </button>
                )}
              </div>
            </section>

            <section className="clipboard-danger">
              <button type="button" className="btn btn--danger btn--sm" onClick={() => setConfirmAction('delete')}>
                <Icon name="trash" size={16} /> Delete event
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
