import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { deleteEvent } from './api'
import { eventKeys } from './queryKeys'

interface DeleteEventInput {
  id: string
  redirectTo?: string
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: ({ id }: DeleteEventInput) => deleteEvent(id),
    onSuccess: (_data, { id, redirectTo }) => {
      queryClient.removeQueries({ queryKey: eventKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: eventKeys.mine() })
      if (redirectTo) {
        navigate(redirectTo)
      }
    },
  })
}
