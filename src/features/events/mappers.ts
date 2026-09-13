import type {
  EventDto,
  EventFilters,
  EventStatus,
  EventVisibility,
  TagDto,
  UserRole,
} from '@/types'

interface ApiEventTagDto {
  tagId: string
  tagName: string
}

interface ApiEventDto {
  id: string
  title: string
  description: string | null
  location: string | null
  startsAt: string
  endsAt: string
  capacity: number
  organizerId: string
  organizerName: string
  status: EventStatus
  visibility?: EventVisibility
  going?: number
  createdAt: string
  tags: ApiEventTagDto[]
}

export function toEventDto(raw: ApiEventDto): EventDto {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? '',
    location: raw.location ?? '',
    start: raw.startsAt,
    end: raw.endsAt,
    capacity: raw.capacity,
    going: raw.going ?? 0,
    status: raw.status,
    visibility: raw.visibility ?? 'Public',
    organizerId: raw.organizerId,
    organizerName: raw.organizerName,
    tags: raw.tags.map((tag) => ({ id: tag.tagId, name: tag.tagName, color: '#6366F1' })),
    createdAt: raw.createdAt,
  }
}

export function attachTagColors(events: EventDto[], tags: TagDto[]): EventDto[] {
  const byId = new Map(tags.map((tag) => [tag.id, tag.color]))
  return events.map((event) => ({
    ...event,
    tags: event.tags.map((tag) => ({ ...tag, color: byId.get(tag.id) ?? tag.color })),
  }))
}

function compareBy(sort: EventFilters['sort']) {
  return (a: EventDto, b: EventDto): number => {
    switch (sort) {
      case 'date-desc':
        return new Date(b.start).getTime() - new Date(a.start).getTime()
      case 'created-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'popularity':
        return b.going - a.going
      case 'date-asc':
      default:
        return new Date(a.start).getTime() - new Date(b.start).getTime()
    }
  }
}

export function applyClientFilters(
  items: EventDto[],
  filters: EventFilters,
  isPublic: boolean,
  role: UserRole | null,
): EventDto[] {
  let list = items
  if (isPublic) list = list.filter((event) => event.status === 'Published')
  else if (role === 'User')
    list = list.filter((event) => event.status !== 'Draft' && event.status !== 'Cancelled')

  const q = filters.q.trim().toLowerCase()
  if (q) {
    list = list.filter((event) =>
      `${event.title} ${event.description} ${event.location}`.toLowerCase().includes(q),
    )
  }
  if (filters.tagIds.length) {
    list = list.filter((event) =>
      filters.tagIds.every((id) => event.tags.some((tag) => tag.id === id)),
    )
  }
  if (filters.status !== 'all') list = list.filter((event) => event.status === filters.status)
  if (filters.timeframe === 'upcoming')
    list = list.filter((event) => new Date(event.end).getTime() >= Date.now())
  if (filters.timeframe === 'past')
    list = list.filter((event) => new Date(event.end).getTime() < Date.now())
  return [...list].sort(compareBy(filters.sort))
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), pages)
  const start = (safePage - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    size: pageSize,
    pages,
  }
}

export type { ApiEventDto, ApiEventTagDto }
