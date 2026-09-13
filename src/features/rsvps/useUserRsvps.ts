import { useQuery } from '@tanstack/react-query'

import { listUserRsvps } from './api'
import { rsvpKeys } from './queryKeys'

export function useUserRsvps(userId: string) {
  return useQuery({
    queryKey: rsvpKeys.byUser(userId),
    queryFn: ({ signal }) => listUserRsvps(userId, signal),
    enabled: Boolean(userId),
  })
}
