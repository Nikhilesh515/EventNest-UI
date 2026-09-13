import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateEventRequest } from '@/types'

import { updateEvent } from './api'
import { eventKeys } from './queryKeys'

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: UpdateEventRequest) => updateEvent(id, values),
    onSuccess: (event) => {
      queryClient.setQueryData(eventKeys.detail(id), event)
      void queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: eventKeys.mine() })
    },
  })
}
