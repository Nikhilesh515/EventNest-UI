import { useQuery } from '@tanstack/react-query'

import { listEventRsvps } from './api'
import { rsvpKeys } from './queryKeys'

export function useEventRsvps(eventId: string) {
  return useQuery({
    queryKey: rsvpKeys.byEvent(eventId),
    queryFn: ({ signal }) => listEventRsvps(eventId, signal),
    enabled: Boolean(eventId),
  })
}
