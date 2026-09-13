import { useQuery } from '@tanstack/react-query'

import { getEvent } from './api'
import { eventKeys } from './queryKeys'

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: ({ signal }) => getEvent(id, signal),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}
