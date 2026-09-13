import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/AuthContext'
import { eventKeys } from '@/features/events/queryKeys'
import type { CreateRsvpRequest } from '@/types'

import { createRsvp } from './api'
import { rsvpKeys } from './queryKeys'

export function useSaveRsvp(eventId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (input: CreateRsvpRequest) => createRsvp(eventId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rsvpKeys.byEvent(eventId) })
      if (user) {
        void queryClient.invalidateQueries({ queryKey: rsvpKeys.byUser(user.id) })
      }
      void queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
    },
  })
}
