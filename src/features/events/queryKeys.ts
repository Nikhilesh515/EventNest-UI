import type { EventFilters } from '@/types'

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: EventFilters) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  count: () => [...eventKeys.all, 'count'] as const,
  mine: (status?: string) => [...eventKeys.all, 'mine', status ?? 'all'] as const,
}
