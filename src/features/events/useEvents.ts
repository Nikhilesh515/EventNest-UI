import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/AuthContext'
import { useTags } from '@/features/tags/useTags'
import { FEATURES } from '@/lib/features'
import type { EventDto, EventFilters, Page } from '@/types'

import { listEvents, queryEvents } from './api'
import type { ServerEventQuery } from './api'
import { applyClientFilters, attachTagColors, paginate } from './mappers'
import { eventKeys } from './queryKeys'

const EMPTY_PAGE: Page<EventDto> = { items: [], total: 0, page: 1, size: 9, pages: 1 }

function toServerQuery(filters: EventFilters): ServerEventQuery {
  return {
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.q || undefined,
    tagId: filters.tagIds,
    visibility:
      filters.visibility === 'all'
        ? undefined
        : filters.visibility === 'public'
          ? 'Public'
          : 'Private',
    status: filters.status === 'all' ? undefined : filters.status,
    timeframe: filters.timeframe,
    sort: filters.sort,
  }
}

export function useEvents(filters: EventFilters) {
  const { status: authStatus, user } = useAuth()
  const tagsQuery = useTags()
  const query = useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: async ({ signal }): Promise<Page<EventDto>> => {
      if (FEATURES.serverEventQuery) {
        return queryEvents(toServerQuery(filters), signal)
      }
      const events = await listEvents({}, signal)
      const isPublic = authStatus !== 'authenticated'
      const filtered = applyClientFilters(events, filters, isPublic, user?.role ?? null)
      return paginate(filtered, filters.page, filters.pageSize)
    },
    staleTime: 30_000,
  })

  const page = useMemo<Page<EventDto>>(() => {
    const base = query.data ?? EMPTY_PAGE
    return { ...base, items: attachTagColors(base.items, tagsQuery.data ?? []) }
  }, [query.data, tagsQuery.data])

  return { ...query, page }
}
