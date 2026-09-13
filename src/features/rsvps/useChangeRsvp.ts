import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/AuthContext'
import { eventKeys } from '@/features/events/queryKeys'
import type { UpdateRsvpRequest } from '@/types'

import { updateRsvp } from './api'
import { rsvpKeys } from './queryKeys'

interface ChangeRsvpInput {
  rsvpId: string
  body: UpdateRsvpRequest
}

/** @requires BP-02 - PUT /api/rsvps/{id} is not routed at the gateway today. */
export function useChangeRsvp(eventId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ rsvpId, body }: ChangeRsvpInput) => updateRsvp(rsvpId, body),
    onSuccess: () => {
      if (eventId) {
        void queryClient.invalidateQueries({ queryKey: rsvpKeys.byEvent(eventId) })
        void queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
      }
      if (user) {
        void queryClient.invalidateQueries({ queryKey: rsvpKeys.byUser(user.id) })
      }
    },
  })
}
