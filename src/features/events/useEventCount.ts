import { useQuery } from '@tanstack/react-query'

import { FEATURES } from '@/lib/features'

import { listEvents, queryEvents } from './api'
import { eventKeys } from './queryKeys'

export function useEventCount() {
  return useQuery({
    queryKey: eventKeys.count(),
    queryFn: async ({ signal }): Promise<number> => {
      if (FEATURES.serverEventQuery) {
        const page = await queryEvents({ page: 1, pageSize: 1 }, signal)
        return page.total
      }
      const events = await listEvents({}, signal)
      return events.length
    },
    staleTime: 60_000,
  })
}
