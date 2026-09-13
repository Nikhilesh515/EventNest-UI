export type EventStatus = 'Draft' | 'Published' | 'Cancelled' | 'Completed'
export type EventVisibility = 'Public' | 'Private'

export interface EventTagDto {
  id: string
  name: string
  color: string
}

export interface EventDto {
  id: string
  title: string
  description: string
  location: string
  start: string
  end: string
  capacity: number
  going: number
  status: EventStatus
  visibility: EventVisibility
  organizerId: string
  organizerName: string
  tags: EventTagDto[]
  createdAt: string
}

export type EventSort = 'date-asc' | 'date-desc' | 'created-desc' | 'popularity'
export type EventTimeframe = 'upcoming' | 'past' | 'all'
export type VisibilityFilter = 'all' | 'public' | 'private'
export type StatusFilter = 'all' | EventStatus

export interface EventFilters {
  q: string
  tagIds: string[]
  visibility: VisibilityFilter
  status: StatusFilter
  timeframe: EventTimeframe
  sort: EventSort
  page: number
  pageSize: number
}

export interface EventTagRequestDto {
  tagId: string
  tagName: string
}

export interface CreateEventRequestDto {
  title: string
  description?: string
  location?: string
  startsAt: string
  endsAt: string
  capacity: number
  tags: EventTagRequestDto[]
}

export interface UpdateEventRequestDto {
  title: string
  description?: string
  location?: string
  startsAt: string
  endsAt: string
  capacity: number
  tags: EventTagRequestDto[]
}

export interface CreateEventRequest {
  title: string
  description?: string
  location?: string
  start: string
  end: string
  capacity: number
  visibility: EventVisibility
  tagIds: string[]
  tagNames?: Record<string, string>
}

export type UpdateEventRequest = CreateEventRequest

export interface EventListQuery {
  status?: EventStatus
}
