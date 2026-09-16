import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiRequestError } from '../lib/api';
import { useAuthStore } from '../lib/auth-store';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Postcard } from '../components/Postcard';
import { ReplyCard } from '../components/ReplyCard';
import { PostcardSpread } from '../components/PostcardSpread';
import { tagStyleVars } from '../lib/tag-style';
import { useColorMode } from '../lib/theme-store';
import type { RsvpStatus } from '../components/RsvpStickerSheet';

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
  goingCount: number;
  organizerId: string;
  organizerName: string;
  status: string;
  visibility: string;
  tags: EventTag[];
}

interface RsvpData {
  id: string;
  eventId: string;
  userId: string;
  status: string;
  guestCount: number;
  notes: string | null;
}

interface EventResponse {
  result: EventData;
}

interface RsvpsResponse {
  result: RsvpData[];
}

function rsvpKeyFromStatus(statusKey: string): RsvpStatus | null {
  const map: Record<string, RsvpStatus> = {
    Confirmed: 'going',
    Maybe: 'maybe',
    Declined: 'notgoing',
    Cancelled: 'cancelled',
  };
  return map[statusKey] || null;
}

const STATUS_FOR_KEY: Record<string, string> = {
  going: 'Confirmed',
  maybe: 'Maybe',
  notgoing: 'Declined',
};

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mode = useColorMode();
  const { user } = useAuthStore();

  const [selectedStatus, setSelectedStatus] = useState<RsvpStatus | null>(null);
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState('');

  const { data: eventData, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get<EventResponse>(`/api/events/${id}`),
    enabled: !!id,
  });

  const { data: myRsvpsData } = useQuery({
    queryKey: ['rsvps', 'user', user?.id],
    queryFn: () => api.get<RsvpsResponse>(`/api/users/${user?.id}/rsvps`),
    enabled: !!user?.id,
  });

  const event = eventData?.result;
  const myRsvp = myRsvpsData?.result?.find((r) => r.eventId === id) || null;

  // Initialize form from existing RSVP
  const initialized = useCallback(() => {
    if (myRsvp && selectedStatus === null) {
      const key = rsvpKeyFromStatus(myRsvp.status);
      setSelectedStatus(key);
      setGuests(myRsvp.guestCount || 1);
      setNotes(myRsvp.notes || '');
    }
  }, [myRsvp, selectedStatus]);

  // Call initialized on render
  if (myRsvp && selectedStatus === null) {
    initialized();
  }

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStatus) throw new Error('No status selected');
      if (selectedStatus === 'cancelled') {
        await api.delete(`/api/events/${id}/rsvps`);
        return;
      }
      const status = STATUS_FOR_KEY[selectedStatus] ?? 'Confirmed';
      const payload = { status, guestCount: guests, notes: notes || null };
      if (myRsvp) {
        await api.put(`/api/rsvps/${myRsvp.id}`, payload);
        return;
      }
      const created = await api.post<{ result: RsvpData }>(`/api/events/${id}/rsvps`, {
        guestCount: guests,
        notes: notes || null,
      });
      if (status !== 'Confirmed' && created?.result?.id) {
        await api.put(`/api/rsvps/${created.result.id}`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['rsvps', 'user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.delete(`/api/events/${id}/rsvps`),
    onSuccess: () => {
      setSelectedStatus(null);
      setGuests(1);
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['rsvps', 'user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  if (eventLoading) {
    return (
      <div className="stack-6">
        <Breadcrumbs items={[{ label: 'Events', href: '/events' }, { label: 'Loading…' }]} />
        <div className="page-doc" aria-busy="true">
          <div className="page-doc__tape" aria-hidden="true" />
          <div className="page-doc__content">
            <p className="page-doc__overline">Event · 手帳</p>
            <h1 className="page-doc__title">Loading…</h1>
          </div>
        </div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="stack-6">
        <Breadcrumbs items={[{ label: 'Events', href: '/events' }, { label: 'Not found' }]} />
        <div className="page-doc">
          <div className="page-doc__tape" aria-hidden="true" />
          <div className="page-doc__content">
            <h1 className="page-doc__title">Event not found</h1>
            <p className="page-doc__subtitle">
              {(eventError as ApiRequestError)?.message || "We couldn't find that event."}
            </p>
            <button className="btn btn--primary" onClick={() => navigate('/events')}>
              Back to events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === event.organizerId;
  const isEnded = new Date(event.endsAt) < new Date() || event.status === 'Completed';

  return (
    <div className="stack-6">
      <Breadcrumbs items={[
        { label: 'Events', href: '/events' },
        { label: event.title },
      ]} />

      <header className="page-doc">
        <span className="washi page-doc__tape washi--sora" aria-hidden="true" />
        <span className="washi page-doc__corner-tape washi--sakura" aria-hidden="true" />
        <span className="page-doc__kanji kanji-watermark" aria-hidden="true" lang="ja">祭</span>
        <div className="page-doc__head">
          <p className="page-doc__overline">Event · 手帳</p>
          <div className="cluster-3" style={{ marginBlock: 'var(--space-2)' }}>
            <span className={`badge ${event.status === 'Published' ? 'badge--published' : event.status === 'Draft' ? 'badge--draft' : event.status === 'Cancelled' ? 'badge--cancelled' : 'badge--completed'}`}>
              {event.status}
            </span>
            <span className={`vis-badge ${event.visibility === 'Private' ? 'vis-badge--private' : 'vis-badge--public'}`}>
              {event.visibility}
            </span>
          </div>
          <h1 className="page-doc__title wrap-anywhere">{event.title}</h1>
          {event.tags.length > 0 && (
            <div className="cluster" style={{ marginTop: 'var(--space-3)' }}>
              {event.tags.map((tag, i) => (
                <span
                  key={tag.id}
                  className="tag-chip tag-chip--md"
                  style={tagStyleVars(tag.color, mode, i % 2 === 0 ? -1 : 1)}
                >
                  <span className="tag-chip__dot" />
                  <span className="tag-chip__label">{tag.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <PostcardSpread
        postcard={
          <Postcard
            event={event}
            isOwner={isOwner}
            canManage={isOwner}
            hasManageRsvp={isOwner}
            isEnded={isEnded}
          />
        }
        reply={
          <ReplyCard
            event={event}
            isOwner={isOwner}
            isEnded={isEnded}
            showHanko={!!myRsvp && rsvpKeyFromStatus(myRsvp.status) === 'going'}
            selectedStatus={selectedStatus}
            guests={guests}
            notes={notes}
            loading={submitMutation.isPending || cancelMutation.isPending}
            onSelect={setSelectedStatus}
            onGuestsChange={setGuests}
            onNotesChange={setNotes}
            onSubmit={() => submitMutation.mutate()}
            onCancel={() => cancelMutation.mutate()}
          />
        }
      />
    </div>
  );
}
