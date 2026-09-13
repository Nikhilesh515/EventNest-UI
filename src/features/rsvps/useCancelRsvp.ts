import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/AuthContext'
import { eventKeys } from '@/features/events/queryKeys'

import { cancelRsvp } from './api'
import { rsvpKeys } from './queryKeys'

export function useCancelRsvp(eventId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (overrideEventId?: string) => cancelRsvp(overrideEventId ?? eventId),
    onSuccess: (_data, overrideEventId) => {
      const target = overrideEventId ?? eventId
      if (target) {
        void queryClient.invalidateQueries({ queryKey: rsvpKeys.byEvent(target) })
        void queryClient.invalidateQueries({ queryKey: eventKeys.detail(target) })
      }
      if (user) {
        void queryClient.invalidateQueries({ queryKey: rsvpKeys.byUser(user.id) })
      }
    },
  })
}
