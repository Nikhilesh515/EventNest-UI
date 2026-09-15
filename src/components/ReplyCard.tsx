import { RsvpStickerSheet, type RsvpStatus } from './RsvpStickerSheet';
import { CapacityMeter } from './CapacityMeter';

interface EventData {
  id: string;
  status: string;
  endsAt: string;
  capacity: number;
  goingCount: number;
  organizerId: string;
}

interface ReplyCardProps {
  event: EventData;
  isOwner: boolean;
  isEnded: boolean;
  selectedStatus: RsvpStatus | null;
  guests: number;
  notes: string;
  loading: boolean;
  onSelect: (status: RsvpStatus) => void;
  onGuestsChange: (guests: number) => void;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ReplyCard({
  event,
  isOwner,
  isEnded,
  selectedStatus,
  guests,
  notes,
  loading,
  onSelect,
  onGuestsChange,
  onNotesChange,
  onSubmit,
  onCancel,
}: ReplyCardProps) {
  const isFull = event.capacity > 0 && event.goingCount >= event.capacity;
  const showRsvpForm = !isOwner && event.status === 'Published' && !isEnded;

  return (
    <aside className="spread__reply reply-card">
      <div className="reply-card__panel rsvp-card">
        <p className="rsvp-card__legend">Your RSVP</p>

        {!showRsvpForm ? (
          <>
            {isOwner && <p className="rsvp-closed-note">You&apos;re hosting this event.</p>}
            {event.status === 'Draft' && <p className="rsvp-closed-note">This event isn&apos;t published yet.</p>}
            {event.status === 'Cancelled' && <p className="rsvp-closed-note">This event was cancelled.</p>}
            {isEnded && <p className="rsvp-closed-note">This event has ended on {formatDate(event.endsAt)}.</p>}
          </>
        ) : (
          <RsvpStickerSheet
            currentStatus={selectedStatus}
            guests={guests}
            notes={notes}
            capacity={event.capacity}
            going={event.goingCount}
            disabled={isFull}
            loading={loading}
            onSelect={onSelect}
            onGuestsChange={onGuestsChange}
            onNotesChange={onNotesChange}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        )}
      </div>

      <section className="reply-card__panel">
        <p className="page-doc__overline">Capacity</p>
        <CapacityMeter going={event.goingCount} capacity={event.capacity} />
      </section>
    </aside>
  );
}
