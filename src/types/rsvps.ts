export type RsvpStatus = 'Confirmed' | 'Maybe' | 'Declined' | 'Cancelled';

export interface Rsvp {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  status: RsvpStatus;
  guestCount: number;
  notes: string | null;
  respondedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RsvpDetail extends Rsvp {
  eventTitle: string | null;
  eventStartsAt: string | null;
  eventLocation: string | null;
}

export interface CreateRsvpInput {
  guestCount?: number;
  notes?: string | null;
}

export interface UpdateRsvpInput {
  status?: RsvpStatus;
  guestCount?: number;
  notes?: string | null;
}
