import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { EventFilters, EventSort, EventStatus, VisibilityFilter } from '@/types'

const STATUSES: EventStatus[] = ['Draft', 'Published', 'Cancelled', 'Completed']

function parseFilters(params: URLSearchParams): EventFilters {
  const statusParam = params.get('status') ?? 'all'
  const visibilityParam = (params.get('visibility') ?? 'all') as VisibilityFilter
  const timeframeParam = (params.get('timeframe') ?? 'upcoming') as EventFilters['timeframe']
  const sortParam = (params.get('sort') ?? 'date-asc') as EventSort
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)
  const pageSize = Math.max(1, Number(params.get('pageSize') ?? '9') || 9)
  const tagParam = params.get('tagId')
  return {
    q: params.get('q') ?? '',
    tagIds: tagParam ? tagParam.split(',').filter(Boolean) : [],
    visibility: ['all', 'public', 'private'].includes(visibilityParam) ? visibilityParam : 'all',
    status:
      statusParam === 'all' || !STATUSES.includes(statusParam as EventStatus)
        ? 'all'
        : (statusParam as EventStatus),
    timeframe: ['upcoming', 'past', 'all'].includes(timeframeParam) ? timeframeParam : 'upcoming',
    sort: ['date-asc', 'date-desc', 'created-desc', 'popularity'].includes(sortParam)
      ? sortParam
      : 'date-asc',
    page,
    pageSize,
  }
}

function serializeFilters(filters: EventFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.tagIds.length) params.set('tagId', filters.tagIds.join(','))
  if (filters.visibility !== 'all') params.set('visibility', filters.visibility)
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.timeframe !== 'upcoming') params.set('timeframe', filters.timeframe)
  if (filters.sort !== 'date-asc') params.set('sort', filters.sort)
  if (filters.page !== 1) params.set('page', String(filters.page))
  if (filters.pageSize !== 9) params.set('pageSize', String(filters.pageSize))
  return params
}

export function useEventFilters() {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(params), [params])

  const update = useCallback(
    (patch: Partial<EventFilters>, opts?: { replace?: boolean }) => {
      const next: EventFilters = { ...filters, ...patch, page: patch.page ?? 1 }
      setParams(serializeFilters(next), { replace: opts?.replace ?? false })
    },
    [filters, setParams],
  )

  return { filters, update }
}
