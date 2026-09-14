import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/AuthContext'
import { eventKeys } from '@/features/events/queryKeys'
import type { UpdateRsvpRequest } from '@/types'

import { updateRsvp } from './api'
import { rsvpKeys } from './queryKeys'

interface ChangeRsvpInput {
  rsvpId: string
  body: UpdateRsvpRequest
  eventId?: string
}

export function useChangeRsvp(eventId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ rsvpId, body }: ChangeRsvpInput) => updateRsvp(rsvpId, body),
    onSuccess: (_data, { eventId: overrideEventId }) => {
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
