import type { EventTag } from './tags';

export type EventStatus = 'Draft' | 'Published' | 'Cancelled' | 'Completed';
export type EventVisibility = 'Public' | 'Private';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  goingCount: number;
  maybeCount: number;
  organizerId: string;
  organizerName: string;
  status: EventStatus;
  visibility: EventVisibility;
  tags: EventTag[];
  createdAt: string;
  updatedAt: string;
}

export interface EventListResponse {
  items: Event[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface EventFormValues {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  visibility: EventVisibility;
  tagIds: string[];
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  visibility: EventVisibility;
  tagIds?: string[];
}

export type UpdateEventInput = Partial<CreateEventInput>;

export type { EventTag };
