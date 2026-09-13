import { apiClient } from '@/api/client'
import { EVENTS } from '@/api/endpoints'
import type {
  CreateEventRequest,
  EventDto,
  EventSort,
  EventStatus,
  EventTimeframe,
  EventVisibility,
  Page,
  UpdateEventRequest,
} from '@/types'
import { toEventDto } from './mappers'
import type { ApiEventDto } from './mappers'

interface ApiPageDto<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface ServerEventQuery {
  page: number
  pageSize: number
  search?: string
  tagId?: string[]
  visibility?: EventVisibility
  status?: EventStatus
  timeframe?: EventTimeframe
  sort?: EventSort
}

export async function listEvents(
  params: { status?: EventStatus } = {},
  signal?: AbortSignal,
): Promise<EventDto[]> {
  const { data } = await apiClient.get<ApiEventDto[]>(EVENTS.list, {
    params: params.status ? { status: params.status } : undefined,
    signal,
  })
  return data.map(toEventDto)
}

export async function queryEvents(
  params: ServerEventQuery,
  signal?: AbortSignal,
): Promise<Page<EventDto>> {
  const { data } = await apiClient.get<ApiPageDto<ApiEventDto>>(EVENTS.list, {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
      tagId: params.tagId && params.tagId.length ? params.tagId.join(',') : undefined,
      visibility: params.visibility,
      status: params.status,
      timeframe: params.timeframe,
      sort: params.sort,
    },
    signal,
  })
  return {
    items: data.items.map(toEventDto),
    total: data.total,
    page: data.page,
    size: data.size,
    pages: data.pages,
  }
}

/** @requires BP-07 - GET /api/events/my. */
export async function listMyEvents(signal?: AbortSignal): Promise<EventDto[]> {
  const { data } = await apiClient.get<ApiEventDto[]>(EVENTS.mine, { signal })
  return data.map(toEventDto)
}

export async function getEvent(id: string, signal?: AbortSignal): Promise<EventDto> {
  const { data } = await apiClient.get<ApiEventDto>(EVENTS.byId(id), { signal })
  return toEventDto(data)
}

function toRequest(body: CreateEventRequest | UpdateEventRequest) {
  return {
    title: body.title,
    description: body.description ?? '',
    location: body.location ?? '',
    startsAt: body.start,
    endsAt: body.end,
    capacity: body.capacity,
    visibility: body.visibility,
    tags: body.tagIds.map((tagId) => ({ tagId, tagName: body.tagNames?.[tagId] ?? tagId })),
  }
}

export async function createEvent(body: CreateEventRequest): Promise<EventDto> {
  const { data } = await apiClient.post<ApiEventDto>(EVENTS.create, toRequest(body))
  return toEventDto(data)
}

export async function updateEvent(id: string, body: UpdateEventRequest): Promise<EventDto> {
  const { data } = await apiClient.put<ApiEventDto>(EVENTS.byId(id), toRequest(body))
  return toEventDto(data)
}

export async function deleteEvent(id: string): Promise<void> {
  await apiClient.delete(EVENTS.byId(id))
}

export async function publishEvent(id: string): Promise<EventDto> {
  const { data } = await apiClient.put<ApiEventDto>(EVENTS.publish(id))
  return toEventDto(data)
}

export async function cancelEvent(id: string): Promise<EventDto> {
  const { data } = await apiClient.put<ApiEventDto>(EVENTS.cancel(id))
  return toEventDto(data)
}

/** @requires BP-09 - PUT /api/events/{id}/complete. */
export async function completeEvent(id: string): Promise<EventDto> {
  const { data } = await apiClient.put<ApiEventDto>(EVENTS.complete(id))
  return toEventDto(data)
}
